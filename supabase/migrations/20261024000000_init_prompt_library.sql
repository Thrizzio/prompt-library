-- Personal Prompt Library Schema and Public Access Policies (Single-User Showcase)

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for category queries
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- 2. Create prompts table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes for search, filtering, and ordering
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON public.prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_favorite ON public.prompts(is_favorite);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);

-- 3. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prompts_updated_at ON public.prompts;
CREATE TRIGGER trigger_prompts_updated_at
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- 5. Public Read Policies (Visitors can browse and copy prompts without login)
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories"
    ON public.categories
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public read prompts" ON public.prompts;
CREATE POLICY "Allow public read prompts"
    ON public.prompts
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 6. Mutation Policies (Protected on the client application by Owner Passkey)
DROP POLICY IF EXISTS "Allow insert categories" ON public.categories;
CREATE POLICY "Allow insert categories"
    ON public.categories
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update categories" ON public.categories;
CREATE POLICY "Allow update categories"
    ON public.categories
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete categories" ON public.categories;
CREATE POLICY "Allow delete categories"
    ON public.categories
    FOR DELETE
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow insert prompts" ON public.prompts;
CREATE POLICY "Allow insert prompts"
    ON public.prompts
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update prompts" ON public.prompts;
CREATE POLICY "Allow update prompts"
    ON public.prompts
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete prompts" ON public.prompts;
CREATE POLICY "Allow delete prompts"
    ON public.prompts
    FOR DELETE
    TO anon, authenticated
    USING (true);

-- 7. Seed initial default categories
INSERT INTO public.categories (name)
VALUES
    ('Coding'),
    ('Writing'),
    ('Research'),
    ('Productivity'),
    ('Learning'),
    ('Other')
ON CONFLICT (name) DO NOTHING;
