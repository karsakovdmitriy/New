-- SQL to create a default admin user in Supabase Auth
-- Note: This should be run in the SQL Editor.
-- Password hashing is handled by Supabase, so it's best to create this user via the Auth UI or CLI.
-- However, if you want to force it via SQL:

/*
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Random UUID
  'admin@sports-mvp.com',
  crypt('admin_password_123', gen_salt('bf')), -- Better to set this via UI
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"System Admin", "role": "admin"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  ''
);
*/
