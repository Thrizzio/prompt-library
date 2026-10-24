-- Personal Prompt Library Initial Schema and RLS Policies

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_categories_user_name UNIQUE (user_id, name)
);

-- Index for category queries by user
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- 2. Create prompts table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes for search, filtering, and ordering
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON public.prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_favorite ON public.prompts(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(user_id, created_at DESC);

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

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- 5. Strict RLS Policies for categories (isolation per authenticated user)
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
CREATE POLICY "Users can view their own categories"
    ON public.categories
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own categories" ON public.categories;
CREATE POLICY "Users can create their own categories"
    ON public.categories
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
CREATE POLICY "Users can update their own categories"
    ON public.categories
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
CREATE POLICY "Users can delete their own categories"
    ON public.categories
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6. Strict RLS Policies for prompts (isolation per authenticated user)
DROP POLICY IF EXISTS "Users can view their own prompts" ON public.prompts;
CREATE POLICY "Users can view their own prompts"
    ON public.prompts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own prompts" ON public.prompts;
CREATE POLICY "Users can create their own prompts"
    ON public.prompts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own prompts" ON public.prompts;
CREATE POLICY "Users can update their own prompts"
    ON public.prompts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own prompts" ON public.prompts;
CREATE POLICY "Users can delete their own prompts"
    ON public.prompts
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 7. Default categories trigger on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.categories (user_id, name)
    VALUES
        (NEW.id, 'Coding'),
        (NEW.id, 'Writing'),
        (NEW.id, 'Research'),
        (NEW.id, 'Productivity'),
        (NEW.id, 'Learning'),
        (NEW.id, 'Other')
    ON CONFLICT (user_id, name) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_categories();
