-- Create enum for query categories
CREATE TYPE public.query_category AS ENUM ('question', 'request', 'complaint', 'feedback', 'other');

-- Create enum for query status
CREATE TYPE public.query_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');

-- Create enum for priority levels
CREATE TYPE public.query_priority AS ENUM ('1', '2', '3', '4', '5');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'customer');

-- Create profiles table for additional user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role app_role DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create queries table
CREATE TABLE public.queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender TEXT NOT NULL,
  channel TEXT NOT NULL,
  message TEXT NOT NULL,
  category query_category DEFAULT 'other',
  priority query_priority DEFAULT '3',
  status query_status DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create query history table for audit trail
CREATE TABLE public.query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES public.queries(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for queries (all authenticated users can see all queries)
CREATE POLICY "All authenticated users can view all queries"
  ON public.queries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can create queries"
  ON public.queries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All authenticated users can update queries"
  ON public.queries FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can delete queries"
  ON public.queries FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for query_history
CREATE POLICY "All authenticated users can view query history"
  ON public.query_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can create history entries"
  ON public.query_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_queries_updated_at
  BEFORE UPDATE ON public.queries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for queries table
ALTER PUBLICATION supabase_realtime ADD TABLE public.queries;

-- Insert sample queries for demo
INSERT INTO public.queries (sender, channel, message, category, priority, status) VALUES
('john@example.com', 'email', 'I need help with my recent order', 'question', '3', 'open'),
('sarah@example.com', 'twitter', 'Your service is amazing!', 'feedback', '2', 'open'),
('mike@example.com', 'chat', 'I want to request a refund', 'request', '4', 'open'),
('lisa@example.com', 'email', 'The app is not working properly', 'complaint', '5', 'open'),
('tom@example.com', 'facebook', 'Can you add dark mode?', 'request', '2', 'open');