CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- First account created becomes admin
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_first_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

CREATE TABLE public.rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  guest_count text NOT NULL CHECK (char_length(guest_count) <= 20),
  items text[] NOT NULL DEFAULT '{}',
  custom_item text CHECK (custom_item IS NULL OR char_length(custom_item) <= 200),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.rsvps TO anon, authenticated;
GRANT SELECT, DELETE ON public.rsvps TO authenticated;
GRANT ALL ON public.rsvps TO service_role;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can RSVP" ON public.rsvps FOR INSERT TO anon, authenticated
  WITH CHECK (cardinality(items) <= 20);
CREATE POLICY "Admins read RSVPs" ON public.rsvps FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete RSVPs" ON public.rsvps FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));