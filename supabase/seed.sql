-- 1. Create the User (auth.users)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@kemurnian.sch.id', -- YOUR LOGIN EMAIL
  crypt('password', gen_salt('bf', 10)), -- PASSWORD: "password"
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 2. Create the Identity (auth.identities) - FIXED WITH PROVIDER_ID
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id, -- <--- THIS WAS MISSING CAUSING THE ERROR
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "email": "admin@kemurnian.sch.id"}',
  'email',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- <--- MATCHING ID IS REQUIRED HERE
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;
