import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8100);
const JWT_SECRET = process.env.JWT_SECRET || 'taklifnoma_super_secret_2026_x';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const runtimeDbPath = path.join(dataDir, 'runtime-db.json');
const uploadsDir = path.join(dataDir, 'uploads');
const seedDbPath = path.join(__dirname, '..', 'src', 'assets', 'database.json');

const DEFAULT_DB = {
  users: [],
  orders: [],
  rsvps: [],
  admin: null,
};

const ADMIN_ACCOUNT = {
  id: 999,
  email: 'admin@admin.com',
  password: 'Doniyor2007',
  isAdmin: true,
};

let writeQueue = Promise.resolve();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const sanitizeDatabase = (data) => ({
  users: Array.isArray(data?.users) ? data.users : [],
  orders: Array.isArray(data?.orders) ? data.orders : [],
  rsvps: Array.isArray(data?.rsvps) ? data.rsvps : [],
  admin: data?.admin && typeof data.admin === 'object' ? data.admin : null,
});

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

const normalizeText = (value, fallback = '') => {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value).trim();
};

const normalizeOptionalText = (value, fallback = '') => normalizeText(value, fallback);

const IMAGE_EXTENSION_BY_MIME = {
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const AUDIO_EXTENSION_BY_MIME = {
  'audio/aac': 'aac',
  'audio/flac': 'flac',
  'audio/m4a': 'm4a',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/webm': 'webm',
  'audio/x-m4a': 'm4a',
  'audio/x-wav': 'wav',
};

const CYRILLIC_TO_LATIN_MAP = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  ғ: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  қ: 'q',
  л: 'l',
  м: 'm',
  н: 'n',
  ң: 'ng',
  о: 'o',
  ө: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ұ: 'u',
  ў: 'o',
  ӯ: 'u',
  ф: 'f',
  х: 'x',
  ҳ: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sh',
  ъ: '',
  ь: '',
  ы: 'y',
  э: 'e',
  є: 'e',
  і: 'i',
  ї: 'yi',
  ю: 'yu',
  я: 'ya',
  ә: 'a',
  ґ: 'g',
  ҷ: 'j',
  ӣ: 'i',
  ү: 'u',
};

const transliterateToLatin = (value = '') => String(value)
  .toLowerCase()
  .split('')
  .map((character) => CYRILLIC_TO_LATIN_MAP[character] ?? character)
  .join('');

const slugify = (...parts) => {
  const base = transliterateToLatin(
    parts
    .filter(Boolean)
    .join('-')
  )
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return base || 'taklifnoma';
};

const ensureUniqueSlug = (orders, desiredSlug, excludeUuid = null) => {
  let slug = desiredSlug;
  let prefix = 2;

  while (orders.some((order) => order.slug === slug && order.invite_uuid !== excludeUuid)) {
    slug = `${prefix}/${desiredSlug}`;
    prefix += 1;
  }

  return slug;
};

const findOrder = (orders, idOrSlug) => {
  const cleanId = String(idOrSlug).trim();
  return orders.find((order) => order.invite_uuid === cleanId || order.slug === cleanId);
};

const resolveImageExtension = (fileName, mimeType) => {
  const fileExtension = path.extname(normalizeText(fileName)).replace('.', '').toLowerCase();

  if (fileExtension) {
    return fileExtension.replace(/[^a-z0-9]/g, '') || 'png';
  }

  return IMAGE_EXTENSION_BY_MIME[mimeType] || 'png';
};

const resolveAudioExtension = (fileName, mimeType) => {
  const fileExtension = path.extname(normalizeText(fileName)).replace('.', '').toLowerCase();

  if (fileExtension) {
    return fileExtension.replace(/[^a-z0-9]/g, '') || 'mp3';
  }

  return AUDIO_EXTENSION_BY_MIME[mimeType] || 'mp3';
};

const saveUploadedImage = async ({ dataUrl, fileName, mimeType }) => {
  const match = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);

  if (!match) {
    throw httpError(400, 'Invalid image payload');
  }

  const resolvedMimeType = normalizeText(mimeType) || match[1];

  if (!resolvedMimeType.startsWith('image/')) {
    throw httpError(400, 'Only image uploads are supported');
  }

  const buffer = Buffer.from(match[2], 'base64');

  if (!buffer.length) {
    throw httpError(400, 'Image file is empty');
  }

  if (buffer.length > 10 * 1024 * 1024) {
    throw httpError(400, 'Image file is too large');
  }

  await fs.mkdir(uploadsDir, { recursive: true });

  const fileExtension = resolveImageExtension(fileName, resolvedMimeType);
  const fileNameSafe = `${randomUUID()}.${fileExtension}`;
  const filePath = path.join(uploadsDir, fileNameSafe);

  await fs.writeFile(filePath, buffer);

  return `/uploads/${fileNameSafe}`;
};

const saveUploadedAudio = async ({ dataUrl, fileName, mimeType }) => {
  const match = String(dataUrl).match(/^data:(audio\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);

  if (!match) {
    throw httpError(400, 'Invalid audio payload');
  }

  const resolvedMimeType = normalizeText(mimeType) || match[1];

  if (!resolvedMimeType.startsWith('audio/')) {
    throw httpError(400, 'Only audio uploads are supported');
  }

  const buffer = Buffer.from(match[2], 'base64');

  if (!buffer.length) {
    throw httpError(400, 'Audio file is empty');
  }

  if (buffer.length > 20 * 1024 * 1024) {
    throw httpError(400, 'Audio file is too large');
  }

  await fs.mkdir(uploadsDir, { recursive: true });

  const fileExtension = resolveAudioExtension(fileName, resolvedMimeType);
  const fileNameSafe = `${randomUUID()}.${fileExtension}`;
  const filePath = path.join(uploadsDir, fileNameSafe);

  await fs.writeFile(filePath, buffer);

  return `/uploads/${fileNameSafe}`;
};

const getNextNumericId = (items) => (
  items.length > 0 ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1
);

const sortByNewestId = (items) => [...items].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

const issueToken = (user) => jwt.sign(
  { id: user.id, email: user.email, isAdmin: Boolean(user.isAdmin) },
  JWT_SECRET
);

const userResponse = (user) => ({
  id: user.id,
  email: user.email,
  isAdmin: Boolean(user.isAdmin),
});

const getAdminAccount = (data) => {
  const storedAdmin = data?.admin && typeof data.admin === 'object' ? data.admin : {};

  return {
    id: ADMIN_ACCOUNT.id,
    email: normalizeEmail(storedAdmin.email || ADMIN_ACCOUNT.email),
    password: storedAdmin.password || ADMIN_ACCOUNT.password,
    password_hash: storedAdmin.password_hash || null,
    isAdmin: true,
  };
};

const verifyAccountPassword = async (account, password) => {
  if (account.password_hash) {
    return bcrypt.compare(password, account.password_hash);
  }

  return normalizeText(account.password) === password;
};

const buildAdminOverview = (data) => {
  const adminAccount = getAdminAccount(data);
  const creatorEmailById = new Map(
    data.users.map((user) => [Number(user.id), user.email])
  );
  const userStatsById = new Map(
    data.users.map((user) => [
      Number(user.id),
      {
        invitation_count: 0,
        total_views: 0,
        total_rsvps: 0,
      },
    ])
  );
  const totals = {
    invitations: 0,
    views: 0,
    rsvps: 0,
  };

  creatorEmailById.set(Number(adminAccount.id), adminAccount.email);

  const orders = [];
  const deleted_orders = [];

  sortByNewestId(data.orders).forEach((order) => {
    const views = Number(order.views_count) || 0;
    const rsvps = Number(order.rsvp_count) || 0;
    const userStats = userStatsById.get(Number(order.user_id));

    if (!order.is_deleted) {
      totals.invitations += 1;
      totals.views += views;
      totals.rsvps += rsvps;

      if (userStats) {
        userStats.invitation_count += 1;
        userStats.total_views += views;
        userStats.total_rsvps += rsvps;
      }
    }

    const extendedOrder = {
      ...order,
      user_email: creatorEmailById.get(Number(order.user_id)) || 'Unknown user',
    };

    if (order.is_deleted) {
      deleted_orders.push(extendedOrder);
    } else {
      orders.push(extendedOrder);
    }
  });

  let activeCreators = 0;
  const users = [];
  const deleted_users = [];
  
  sortByNewestId(data.users).forEach((user) => {
    const stats = userStatsById.get(Number(user.id)) || {
      invitation_count: 0,
      total_views: 0,
      total_rsvps: 0,
    };

    const serializedUser = {
      id: user.id,
      email: user.email,
      created_at: user.created_at || null,
      invitation_count: stats.invitation_count,
      total_views: stats.total_views,
      total_rsvps: stats.total_rsvps,
      is_active_creator: stats.invitation_count > 0,
      is_deleted: Boolean(user.is_deleted),
    };

    if (!serializedUser.is_deleted) {
      if (serializedUser.is_active_creator) {
        activeCreators += 1;
      }
      users.push(serializedUser);
    } else {
      deleted_users.push(serializedUser);
    }
  });

  return {
    totals: {
      ...totals,
      signups: data.users.length,
      active_creators: activeCreators,
    },
    orders,
    deleted_orders,
    users,
    deleted_users,
  };
};

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const readSeedDatabase = async () => {
  try {
    const raw = await fs.readFile(seedDbPath, 'utf8');
    return sanitizeDatabase(JSON.parse(raw));
  } catch (error) {
    console.warn('Failed to read seed database, using defaults.', error.message);
    return { ...DEFAULT_DB };
  }
};

const ensureRuntimeDatabase = async () => {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(runtimeDbPath);
  } catch {
    const initialData = await readSeedDatabase();
    await fs.writeFile(runtimeDbPath, JSON.stringify(initialData, null, 2));
  }
};

const readRuntimeDatabase = async () => {
  await ensureRuntimeDatabase();

  try {
    const raw = await fs.readFile(runtimeDbPath, 'utf8');
    return sanitizeDatabase(JSON.parse(raw));
  } catch (error) {
    console.warn('Runtime database was unreadable, recreating it.', error.message);
    const initialData = await readSeedDatabase();
    await fs.writeFile(runtimeDbPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
};

const writeRuntimeDatabase = async (data) => {
  await fs.writeFile(runtimeDbPath, JSON.stringify(sanitizeDatabase(data), null, 2));
};

const getDatabase = async () => {
  await writeQueue;
  return readRuntimeDatabase();
};

const updateDatabase = async (mutator) => {
  const operation = async () => {
    const data = await readRuntimeDatabase();
    const result = await mutator(data);
    await writeRuntimeDatabase(data);
    return result;
  };

  const nextWrite = writeQueue.then(operation, operation);
  writeQueue = nextWrite.then(() => undefined, () => undefined);
  return nextWrite;
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired session' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return next();
};

const buildOrderCreatePayload = (body) => ({
  template_id: normalizeOptionalText(body.template_id) || 'royal-gold',
  groom_name: normalizeOptionalText(body.groom_name),
  bride_name: normalizeOptionalText(body.bride_name),
  wedding_date: normalizeOptionalText(body.wedding_date),
  wedding_time: normalizeOptionalText(body.wedding_time),
  location_name: normalizeOptionalText(body.location_name),
  location_url: normalizeOptionalText(body.location_url),
  welcome_text: normalizeOptionalText(body.welcome_text, 'Bizning baxtli kunimizga xush kelibsiz!'),
  music_url: normalizeOptionalText(body.music_url),
  image_url: normalizeOptionalText(body.image_url),
  phone: normalizeOptionalText(body.phone),
  payment_status: normalizeOptionalText(body.payment_status, 'pending'),
});

const buildOrderUpdatePayload = (body, { allowAdminFields = false } = {}) => {
  const updates = {};
  const editableFields = [
    'template_id',
    'groom_name',
    'bride_name',
    'wedding_date',
    'wedding_time',
    'location_name',
    'location_url',
    'welcome_text',
    'music_url',
    'image_url',
    'phone',
  ];

  if (allowAdminFields) {
    editableFields.push('payment_status');
  }

  editableFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      updates[field] = normalizeOptionalText(body[field]);
    }
  });

  return updates;
};

const buildRsvpPayload = (body) => ({
  name: normalizeOptionalText(body.name),
  wish: normalizeOptionalText(body.wish),
  status: normalizeOptionalText(body.status) === 'declined' ? 'declined' : 'attending',
});

app.get('/api/health', async (_req, res) => {
  await ensureRuntimeDatabase();
  res.json({ ok: true });
});

app.post('/api/uploads/image', authenticateToken, async (req, res) => {
  const dataUrl = normalizeText(req.body?.data_url);
  const fileName = normalizeText(req.body?.file_name);
  const mimeType = normalizeText(req.body?.mime_type);

  if (!dataUrl) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  try {
    const relativePath = await saveUploadedImage({ dataUrl, fileName, mimeType });
    const origin = `${req.protocol}://${req.get('host')}`;

    return res.status(201).json({
      url: `${origin}${relativePath}`,
      path: relativePath,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Image upload failed' });
  }
});

app.post('/api/uploads/audio', authenticateToken, async (req, res) => {
  const dataUrl = normalizeText(req.body?.data_url);
  const fileName = normalizeText(req.body?.file_name);
  const mimeType = normalizeText(req.body?.mime_type);

  if (!dataUrl) {
    return res.status(400).json({ error: 'Audio data is required' });
  }

  try {
    const relativePath = await saveUploadedAudio({ dataUrl, fileName, mimeType });
    const origin = `${req.protocol}://${req.get('host')}`;

    return res.status(201).json({
      url: `${origin}${relativePath}`,
      path: relativePath,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Audio upload failed' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = normalizeText(req.body?.password);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await updateDatabase(async (data) => {
      const adminAccount = getAdminAccount(data);
      const existingUser = data.users.find((user) => normalizeEmail(user.email) === email);
      if (existingUser || email === normalizeEmail(adminAccount.email)) {
        throw httpError(400, 'User already exists');
      }

      const password_hash = await bcrypt.hash(password, 10);
      const newUser = {
        id: getNextNumericId(data.users),
        email,
        password_hash,
        is_admin: false,
        created_at: new Date().toISOString(),
      };
      data.users.push(newUser);

      const responseUser = userResponse({
        id: newUser.id,
        email: newUser.email,
        isAdmin: false,
      });

      return { token: issueToken(responseUser), user: responseUser };
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Signup failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = normalizeText(req.body?.password);
  const adminLoginAttempt = Boolean(req.body?.adminLoginAttempt);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const data = await getDatabase();
    const adminAccount = getAdminAccount(data);

    if (adminLoginAttempt) {
      const passwordMatches =
        email === normalizeEmail(adminAccount.email)
          ? await verifyAccountPassword(adminAccount, password)
          : false;

      if (!passwordMatches) {
        return res.status(400).json({ error: 'Incorrect password' });
      }

      const user = userResponse(adminAccount);
      return res.json({ token: issueToken(user), user });
    }

    if (email === normalizeEmail(adminAccount.email)) {
      const passwordMatches = await verifyAccountPassword(adminAccount, password);

      if (!passwordMatches) {
        return res.status(400).json({ error: 'Incorrect password' });
      }

      const user = userResponse(adminAccount);
      return res.json({ token: issueToken(user), user });
    }

    const user = data.users.find((entry) => normalizeEmail(entry.email) === email);

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const passwordMatches = user.password_hash
      ? await bcrypt.compare(password, user.password_hash)
      : normalizeText(user.password) === password;

    if (!passwordMatches) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const responseUser = userResponse({
      id: user.id,
      email: user.email,
      isAdmin: Boolean(user.is_admin || user.isAdmin),
    });

    return res.json({ token: issueToken(responseUser), user: responseUser });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const data = await getDatabase();
    const adminAccount = getAdminAccount(data);

    let targetUser = null;
    let isTargetAdmin = false;

    if (email === normalizeEmail(adminAccount.email)) {
      targetUser = adminAccount;
      isTargetAdmin = true;
    } else {
      targetUser = data.users.find((u) => normalizeEmail(u.email) === email && !u.is_deleted);
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'No user registered with this email address' });
    }

    // Generate secure token and expiry (1 hour)
    const resetToken = randomUUID();
    const resetTokenExpiry = Date.now() + 3600000;

    await updateDatabase((dbData) => {
      if (isTargetAdmin) {
        dbData.admin = {
          ...(dbData.admin || {}),
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry,
        };
      } else {
        const uIdx = dbData.users.findIndex((u) => normalizeEmail(u.email) === email);
        if (uIdx !== -1) {
          dbData.users[uIdx] = {
            ...dbData.users[uIdx],
            reset_token: resetToken,
            reset_token_expiry: resetTokenExpiry,
          };
        }
      }
    });

    // Send email using SMTP or Resend HTTP API
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM || 'onboarding@resend.dev';

    const smtpUser = process.env.SMTP_USER || 'thedoniyor17@gmail.com';
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT || 587);

    const origin = req.headers.origin || 'https://taklifnoma.vip';
    const resetUrl = `${origin}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #064e3b; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.02em;">Taklifnoma<span style="color: #c5a017;">.vip</span></h2>
        </div>
        <p style="font-size: 15px; color: #1f2937; line-height: 1.5;">Assalomu alaykum,</p>
        <p style="font-size: 15px; color: #4b5563; line-height: 1.5;">You requested a password reset for your Taklifnoma account. Click the button below to recover and change your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #064e3b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(6,78,59,0.15);">Reset Password</a>
        </div>
        <p style="font-size: 13px; color: #9ca3af; line-height: 1.5;">This recovery link is valid for 1 hour. If you did not request this email, please ignore it or contact support.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">© 2026 Taklifnoma.vip. All rights reserved.</p>
      </div>
    `;

    if (resendApiKey) {
      console.log('Sending reset email via Resend HTTP API...');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: resendFrom,
          to: email,
          subject: 'Reset Password — Taklifnoma.vip',
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API error: ${errorText}`);
      }
      console.log(`Password reset link sent to ${email} via Resend`);
    } else if (smtpPass) {
      const cleanPass = String(smtpPass).replace(/\s+/g, '');

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: cleanPass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
        dnsTimeout: 10000,
        family: 4,
      });

      const mailOptions = {
        from: `"Taklifnoma" <${smtpUser}>`,
        to: email,
        subject: 'Reset Password — Taklifnoma.vip',
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Password reset link sent to ${email} via SMTP`);
    } else {
      console.warn(`[SMTP Warning] Neither RESEND_API_KEY nor SMTP_PASS is set. Reset link: ${resetUrl}`);
    }

    res.json({ success: true, message: 'Recovery link sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to send recovery link' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const token = normalizeText(req.body?.token);
  const newPassword = normalizeText(req.body?.newPassword);

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  try {
    const data = await getDatabase();
    const adminAccount = getAdminAccount(data);

    let targetUser = null;
    let isTargetAdmin = false;

    // Check if it matches admin's token
    const adminResetToken = data?.admin?.reset_token;
    const adminResetExpiry = data?.admin?.reset_token_expiry;

    if (adminResetToken && adminResetToken === token) {
      if (Date.now() > Number(adminResetExpiry)) {
        return res.status(400).json({ error: 'Reset token has expired' });
      }
      targetUser = adminAccount;
      isTargetAdmin = true;
    } else {
      // Find normal user with matching token
      targetUser = data.users.find(
        (u) => u.reset_token === token && !u.is_deleted
      );
      if (targetUser && Date.now() > Number(targetUser.reset_token_expiry)) {
        return res.status(400).json({ error: 'Reset token has expired' });
      }
    }

    if (!targetUser) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    await updateDatabase((dbData) => {
      if (isTargetAdmin) {
        dbData.admin = {
          ...(dbData.admin || {}),
          password_hash,
          reset_token: null,
          reset_token_expiry: null,
        };
        // Also clear plain password if stored
        if (dbData.admin.password) {
          delete dbData.admin.password;
        }
      } else {
        const uIdx = dbData.users.findIndex((u) => u.id === targetUser.id);
        if (uIdx !== -1) {
          dbData.users[uIdx] = {
            ...dbData.users[uIdx],
            password_hash,
            reset_token: null,
            reset_token_expiry: null,
          };
          if (dbData.users[uIdx].password) {
            delete dbData.users[uIdx].password;
          }
        }
      }
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to reset password' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const credential = normalizeText(req.body?.credential);

  if (!credential) {
    return res.status(400).json({ error: 'Google credential is required' });
  }

  try {
    // Verify the Google ID token using Google's public tokeninfo endpoint
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    const googleData = await googleRes.json();

    if (!googleRes.ok || googleData.error || googleData.error_description) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    // Verify the token is issued for our app
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && googleData.aud !== clientId) {
      return res.status(400).json({ error: 'Token audience mismatch' });
    }

    if (!googleData.email_verified || googleData.email_verified === 'false') {
      return res.status(400).json({ error: 'Google account email is not verified' });
    }

    const email = normalizeEmail(googleData.email);
    const googleId = normalizeText(googleData.sub);

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Could not read account info from Google' });
    }

    const result = await updateDatabase(async (data) => {
      const adminAccount = getAdminAccount(data);

      if (email === normalizeEmail(adminAccount.email)) {
        throw httpError(400, 'Admin account cannot use Google Sign-In');
      }

      // Find existing user by google_id first, then by email (to link existing accounts)
      let user = data.users.find(
        (u) => u.google_id === googleId || normalizeEmail(u.email) === email
      );

      if (!user) {
        // New user — create account
        user = {
          id: getNextNumericId(data.users),
          email,
          google_id: googleId,
          is_admin: false,
          created_at: new Date().toISOString(),
        };
        data.users.push(user);
      } else if (!user.google_id) {
        // Existing email/password user — link their Google account
        user.google_id = googleId;
      }

      const responseUser = userResponse({
        id: user.id,
        email: user.email,
        isAdmin: Boolean(user.is_admin || user.isAdmin),
      });

      return { token: issueToken(responseUser), user: responseUser };
    });

    return res.json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Google authentication failed' });
  }
});

app.patch('/api/account/email', authenticateToken, async (req, res) => {
  const nextEmail = normalizeEmail(req.body?.email);
  const currentPassword = normalizeText(req.body?.currentPassword);

  if (!nextEmail || !currentPassword) {
    return res.status(400).json({ error: 'New email and current password are required' });
  }

  try {
    const result = await updateDatabase(async (data) => {
      const adminAccount = getAdminAccount(data);
      const emailTakenByUser = data.users.some(
        (user) => normalizeEmail(user.email) === nextEmail && Number(user.id) !== Number(req.user.id)
      );
      const emailTakenByAdmin =
        nextEmail === normalizeEmail(adminAccount.email) && Number(req.user.id) !== ADMIN_ACCOUNT.id;

      if (emailTakenByUser || emailTakenByAdmin) {
        throw httpError(400, 'Email already exists');
      }

      if (Number(req.user.id) === ADMIN_ACCOUNT.id) {
        const passwordMatches = await verifyAccountPassword(adminAccount, currentPassword);

        if (!passwordMatches) {
          throw httpError(400, 'Incorrect password');
        }

        data.admin = {
          ...(data.admin && typeof data.admin === 'object' ? data.admin : {}),
          email: nextEmail,
          password_hash: adminAccount.password_hash || await bcrypt.hash(currentPassword, 10),
        };

        const user = userResponse({
          id: ADMIN_ACCOUNT.id,
          email: nextEmail,
          isAdmin: true,
        });

        return { token: issueToken(user), user };
      }

      const userIndex = data.users.findIndex((user) => Number(user.id) === Number(req.user.id));
      if (userIndex === -1) {
        throw httpError(404, 'User not found');
      }

      const user = data.users[userIndex];
      const passwordMatches = user.password_hash
        ? await bcrypt.compare(currentPassword, user.password_hash)
        : normalizeText(user.password) === currentPassword;

      if (!passwordMatches) {
        throw httpError(400, 'Incorrect password');
      }

      data.users[userIndex] = {
        ...user,
        email: nextEmail,
      };

      const updatedUser = userResponse({
        id: user.id,
        email: nextEmail,
        isAdmin: Boolean(user.is_admin || user.isAdmin),
      });

      return { token: issueToken(updatedUser), user: updatedUser };
    });

    return res.json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Email update failed' });
  }
});

app.patch('/api/account/password', authenticateToken, async (req, res) => {
  const currentPassword = normalizeText(req.body?.currentPassword);
  const nextPassword = normalizeText(req.body?.newPassword);

  if (!currentPassword || !nextPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  try {
    const result = await updateDatabase(async (data) => {
      const adminAccount = getAdminAccount(data);

      if (Number(req.user.id) === ADMIN_ACCOUNT.id) {
        const passwordMatches = await verifyAccountPassword(adminAccount, currentPassword);

        if (!passwordMatches) {
          throw httpError(400, 'Incorrect password');
        }

        data.admin = {
          ...(data.admin && typeof data.admin === 'object' ? data.admin : {}),
          email: adminAccount.email,
          password_hash: await bcrypt.hash(nextPassword, 10),
        };

        const user = userResponse({
          id: ADMIN_ACCOUNT.id,
          email: adminAccount.email,
          isAdmin: true,
        });

        return { token: issueToken(user), user };
      }

      const userIndex = data.users.findIndex((user) => Number(user.id) === Number(req.user.id));
      if (userIndex === -1) {
        throw httpError(404, 'User not found');
      }

      const user = data.users[userIndex];
      const passwordMatches = user.password_hash
        ? await bcrypt.compare(currentPassword, user.password_hash)
        : normalizeText(user.password) === currentPassword;

      if (!passwordMatches) {
        throw httpError(400, 'Incorrect password');
      }

      data.users[userIndex] = {
        ...user,
        password_hash: await bcrypt.hash(nextPassword, 10),
      };

      const updatedUser = userResponse({
        id: user.id,
        email: user.email,
        isAdmin: Boolean(user.is_admin || user.isAdmin),
      });

      return { token: issueToken(updatedUser), user: updatedUser };
    });

    return res.json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Password update failed' });
  }
});

app.get('/api/my-invitations', authenticateToken, async (req, res) => {
  try {
    const data = await getDatabase();
    const wantDeleted = req.query.deleted === 'true';
    const orders = data.orders.filter((order) => 
      Number(order.user_id) === Number(req.user.id) && 
      !!order.is_deleted === wantDeleted
    );
    res.json(sortByNewestId(orders));
  } catch {
    res.status(500).json({ error: 'Failed to load invitations' });
  }
});

app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = await getDatabase();
    res.json(buildAdminOverview(data));
  } catch {
    res.status(500).json({ error: 'Failed to load admin invitations' });
  }
});

app.get('/api/admin/email-settings', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const data = await getDatabase();
    const adminAccount = getAdminAccount(data);
    const senderEmail = normalizeEmail(data?.admin?.sender_email || adminAccount.email);

    res.json({
      sender_email: senderEmail,
    });
  } catch {
    res.status(500).json({ error: 'Failed to load admin email settings' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    await updateDatabase((data) => {
      const userIndex = data.users.findIndex((u) => Number(u.id) === userId);
      if (userIndex === -1) {
        throw httpError(404, 'User not found');
      }
      
      data.users[userIndex] = {
        ...data.users[userIndex],
        is_deleted: true,
      };
      
      // Also soft-delete all invitations created by this user
      data.orders.forEach((order, index) => {
        if (Number(order.user_id) === userId && !order.is_deleted) {
          data.orders[index].is_deleted = true;
          data.orders[index].deleted_at = new Date().toISOString();
        }
      });
    });

    res.json({ success: true });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to delete user' });
  }
});

app.post('/api/admin/users/:id/restore', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    await updateDatabase((data) => {
      const userIndex = data.users.findIndex((u) => Number(u.id) === userId);
      if (userIndex === -1) {
        throw httpError(404, 'User not found');
      }
      
      data.users[userIndex] = {
        ...data.users[userIndex],
        is_deleted: false,
      };
      
      // Also restore all invitations created by this user
      data.orders.forEach((order, index) => {
        if (Number(order.user_id) === userId && order.is_deleted) {
          data.orders[index].is_deleted = false;
          delete data.orders[index].deleted_at;
        }
      });
    });

    res.json({ success: true });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to restore user' });
  }
});

app.patch('/api/admin/email-settings', authenticateToken, requireAdmin, async (req, res) => {
  const senderEmail = normalizeEmail(req.body?.sender_email);

  if (!senderEmail) {
    return res.status(400).json({ error: 'Sender email is required' });
  }

  try {
    const result = await updateDatabase(async (data) => {
      const storedAdmin = data.admin && typeof data.admin === 'object' ? data.admin : {};

      data.admin = {
        ...storedAdmin,
        sender_email: senderEmail,
      };

      return {
        sender_email: senderEmail,
      };
    });

    return res.json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Failed to update admin email settings' });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  const orderData = buildOrderCreatePayload(req.body || {});

  if (!orderData.groom_name || !orderData.bride_name) {
    return res.status(400).json({ error: 'Groom and bride names are required' });
  }

  try {
    const createdOrder = await updateDatabase(async (data) => {
      const invite_uuid = randomUUID();
      const slug = ensureUniqueSlug(
        data.orders,
        slugify(orderData.groom_name, orderData.bride_name)
      );

      const newOrder = {
        ...orderData,
        id: getNextNumericId(data.orders),
        invite_uuid,
        slug,
        user_id: req.user.id,
        views_count: 0,
        rsvp_count: 0,
        created_at: new Date().toISOString(),
      };

      data.orders.push(newOrder);
      return newOrder;
    });

    return res.status(201).json(createdOrder);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Invitation creation failed' });
  }
});

app.get('/api/orders/lookup', async (req, res) => {
  try {
    const data = await getDatabase();
    const order = findOrder(data.orders, normalizeText(req.query?.ref));

    if (!order) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    return res.json(order);
  } catch {
    return res.status(500).json({ error: 'Failed to load invitation' });
  }
});

app.get('/api/orders/lookup/rsvps', async (req, res) => {
  try {
    const data = await getDatabase();
    const order = findOrder(data.orders, normalizeText(req.query?.ref));

    if (!order) {
      return res.json([]);
    }

    const rsvps = data.rsvps
      .filter((rsvp) => rsvp.order_uuid === order.invite_uuid)
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return res.json(rsvps);
  } catch {
    return res.status(500).json({ error: 'Failed to load RSVPs' });
  }
});

app.post('/api/orders/lookup/rsvps', async (req, res) => {
  const payload = buildRsvpPayload(req.body || {});

  if (!payload.name) {
    return res.status(400).json({ error: 'Guest name is required' });
  }

  try {
    const newRsvp = await updateDatabase(async (data) => {
      const order = findOrder(data.orders, normalizeText(req.query?.ref));

      if (!order) {
        throw httpError(404, 'Invitation not found');
      }

      const rsvp = {
        ...payload,
        id: getNextNumericId(data.rsvps),
        order_uuid: order.invite_uuid,
        created_at: new Date().toISOString(),
      };

      data.rsvps.push(rsvp);

      const orderIndex = data.orders.findIndex((item) => item.invite_uuid === order.invite_uuid);
      if (orderIndex !== -1) {
        data.orders[orderIndex].rsvp_count = data.rsvps.filter(
          (entry) => entry.order_uuid === order.invite_uuid
        ).length;
      }

      return rsvp;
    });

    return res.status(201).json(newRsvp);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'RSVP submission failed' });
  }
});

app.post('/api/orders/lookup/view', async (req, res) => {
  try {
    await updateDatabase(async (data) => {
      const reference = normalizeText(req.query?.ref);
      const orderIndex = data.orders.findIndex(
        (order) => order.invite_uuid === reference || order.slug === reference
      );

      if (orderIndex !== -1) {
        data.orders[orderIndex].views_count = (Number(data.orders[orderIndex].views_count) || 0) + 1;
      }
    });

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to register view' });
  }
});

app.get('/api/orders/:idOrSlug', async (req, res) => {
  try {
    const data = await getDatabase();
    const order = findOrder(data.orders, req.params.idOrSlug);

    if (!order) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    return res.json(order);
  } catch {
    return res.status(500).json({ error: 'Failed to load invitation' });
  }
});

app.patch('/api/orders/:uuid', authenticateToken, async (req, res) => {
  try {
    const updatedOrder = await updateDatabase(async (data) => {
      const orderIndex = data.orders.findIndex((order) => order.invite_uuid === req.params.uuid);

      if (orderIndex === -1) {
        throw httpError(404, 'Invitation not found');
      }

      const existingOrder = data.orders[orderIndex];

      if (!req.user?.isAdmin && Number(existingOrder.user_id) !== Number(req.user?.id)) {
        throw httpError(403, 'You do not have permission to edit this invitation');
      }

      const updates = buildOrderUpdatePayload(req.body || {}, {
        allowAdminFields: Boolean(req.user?.isAdmin),
      });
      const nextOrder = {
        ...existingOrder,
        ...updates,
      };

      if (
        updates.groom_name !== existingOrder.groom_name ||
        updates.bride_name !== existingOrder.bride_name
      ) {
        nextOrder.slug = ensureUniqueSlug(
          data.orders,
          slugify(nextOrder.groom_name, nextOrder.bride_name),
          req.params.uuid
        );
      }

      data.orders[orderIndex] = nextOrder;
      return nextOrder;
    });

    return res.json(updatedOrder);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Invitation update failed' });
  }
});

app.delete('/api/orders/:uuid', authenticateToken, async (req, res) => {
  try {
    await updateDatabase(async (data) => {
      const order = data.orders.find((order) => order.invite_uuid === req.params.uuid);

      if (!order) {
        throw httpError(404, 'Invitation not found');
      }

      if (!req.user?.isAdmin && Number(order.user_id) !== Number(req.user?.id)) {
        throw httpError(403, 'You do not have permission to delete this invitation');
      }

      order.is_deleted = true;
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Invitation delete failed' });
  }
});

app.post('/api/orders/:uuid/restore', authenticateToken, async (req, res) => {
  try {
    await updateDatabase(async (data) => {
      const order = data.orders.find((order) => order.invite_uuid === req.params.uuid);

      if (!order) {
        throw httpError(404, 'Invitation not found');
      }

      if (!req.user?.isAdmin && Number(order.user_id) !== Number(req.user?.id)) {
        throw httpError(403, 'You do not have permission to restore this invitation');
      }

      order.is_deleted = false;
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'Invitation restore failed' });
  }
});

app.get('/api/orders/:idOrSlug/rsvps', async (req, res) => {
  try {
    const data = await getDatabase();
    const order = findOrder(data.orders, req.params.idOrSlug);

    if (!order) {
      return res.json([]);
    }

    const rsvps = data.rsvps
      .filter((rsvp) => rsvp.order_uuid === order.invite_uuid)
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return res.json(rsvps);
  } catch {
    return res.status(500).json({ error: 'Failed to load RSVPs' });
  }
});

app.post('/api/orders/:idOrSlug/rsvps', async (req, res) => {
  const payload = buildRsvpPayload(req.body || {});

  if (!payload.name) {
    return res.status(400).json({ error: 'Guest name is required' });
  }

  try {
    const newRsvp = await updateDatabase(async (data) => {
      const order = findOrder(data.orders, req.params.idOrSlug);

      if (!order) {
        throw httpError(404, 'Invitation not found');
      }

      const rsvp = {
        ...payload,
        id: getNextNumericId(data.rsvps),
        order_uuid: order.invite_uuid,
        created_at: new Date().toISOString(),
      };

      data.rsvps.push(rsvp);

      const orderIndex = data.orders.findIndex((item) => item.invite_uuid === order.invite_uuid);
      if (orderIndex !== -1) {
        data.orders[orderIndex].rsvp_count = data.rsvps.filter(
          (entry) => entry.order_uuid === order.invite_uuid
        ).length;
      }

      return rsvp;
    });

    return res.status(201).json(newRsvp);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || 'RSVP submission failed' });
  }
});

app.post('/api/orders/:idOrSlug/view', async (req, res) => {
  try {
    await updateDatabase(async (data) => {
      const orderIndex = data.orders.findIndex(
        (order) => order.invite_uuid === req.params.idOrSlug || order.slug === req.params.idOrSlug
      );

      if (orderIndex !== -1) {
        data.orders[orderIndex].views_count = (Number(data.orders[orderIndex].views_count) || 0) + 1;
      }
    });

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to register view' });
  }
});

app.listen(PORT, async () => {
  await ensureRuntimeDatabase();
  console.log(`Taklifnoma API running on http://localhost:${PORT}`);
  console.log(`Shared data file: ${runtimeDbPath}`);
});
