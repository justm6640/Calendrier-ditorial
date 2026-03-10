-- 20260310000002_fix_users_rls.sql
-- Fixes infinite recursion in the users RLS policy

-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can view users in same agency" ON public.users;

-- Add a simpler policy so users can view their own profile safely
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (id = auth.uid());
