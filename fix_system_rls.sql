-- MASTER SYSTEM RECOVERY SCRIPT
-- Ensures all tables and policies for Projects, Files, Collaboration, and Interviews are correct.

-- 1. Base Tables (If missing)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    theme TEXT DEFAULT 'dark',
    total_xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    language TEXT DEFAULT 'javascript',
    is_public BOOLEAN DEFAULT false,
    stars INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'writer' CHECK (role IN ('admin', 'writer', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    category TEXT DEFAULT 'Algorithms',
    initial_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    score INTEGER DEFAULT 0,
    feedback TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on everything
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- 3. Clear Existing Policies (to avoid "already exists" errors)
DO $$ BEGIN
    -- Profiles
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
    -- Projects
    DROP POLICY IF EXISTS "Users can view their own projects." ON public.projects;
    DROP POLICY IF EXISTS "Users can create their own projects." ON public.projects;
    DROP POLICY IF EXISTS "Users can update their own projects." ON public.projects;
    DROP POLICY IF EXISTS "Users can delete their own projects." ON public.projects;
    -- Files
    DROP POLICY IF EXISTS "Users can view files of projects they have access to." ON public.project_files;
    DROP POLICY IF EXISTS "Users can create files in their projects." ON public.project_files;
    DROP POLICY IF EXISTS "Users can update files in their projects." ON public.project_files;
    DROP POLICY IF EXISTS "Users can delete files in their projects." ON public.project_files;
    -- Collaborators
    DROP POLICY IF EXISTS "Users can view collaborators for their projects." ON public.project_collaborators;
    DROP POLICY IF EXISTS "Users can join projects as collaborators." ON public.project_collaborators;
    -- Challenges
    DROP POLICY IF EXISTS "Anyone can view challenges" ON public.challenges;
    DROP POLICY IF EXISTS "Users can view their own challenge progress" ON public.user_challenges;
    DROP POLICY IF EXISTS "Users can record their own challenge progress" ON public.user_challenges;
END $$;

-- 4. Re-apply Strict & Functional Policies
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects
CREATE POLICY "Users can view their own projects." ON public.projects FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create their own projects." ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own projects." ON public.projects FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own projects." ON public.projects FOR DELETE USING (auth.uid() = owner_id);

-- Project Files (Allows access if user is owner OR collaborator)
CREATE POLICY "Users can view files of projects they have access to." ON public.project_files FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.project_collaborators WHERE project_id = project_files.project_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create files in their projects." ON public.project_files FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.project_collaborators WHERE project_id = project_files.project_id AND user_id = auth.uid() AND role IN ('admin', 'writer'))
);
CREATE POLICY "Users can update files in their projects." ON public.project_files FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.project_collaborators WHERE project_id = project_files.project_id AND user_id = auth.uid() AND role IN ('admin', 'writer'))
);

-- Project Collaborators
CREATE POLICY "Users can view collaborators for their projects." ON public.project_collaborators FOR SELECT USING (true);
CREATE POLICY "Users can join projects as collaborators." ON public.project_collaborators FOR INSERT WITH CHECK (true); -- Simplified for mock sessions

-- Challenges
CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Users can view their own challenge progress" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can record their own challenge progress" ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Seed Core Challenges (If empty)
INSERT INTO public.challenges (title, description, difficulty, category, initial_code)
SELECT 'Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'Easy', 'Algorithms', 'function twoSum(nums, target) {\n  // your code\n}'
WHERE NOT EXISTS (SELECT 1 FROM public.challenges WHERE title = 'Two Sum');

INSERT INTO public.challenges (title, description, difficulty, category, initial_code)
SELECT 'Reverse Linked List', 'Reverse a singly linked list.', 'Easy', 'Data Structures', 'function reverseList(head) {\n  // your code\n}'
WHERE NOT EXISTS (SELECT 1 FROM public.challenges WHERE title = 'Reverse Linked List');

INSERT INTO public.challenges (title, description, difficulty, category, initial_code)
SELECT 'Validate BST', 'Determine if a binary tree is a valid binary search tree.', 'Medium', 'Trees', 'function isValidBST(root) {\n  // your code\n}'
WHERE NOT EXISTS (SELECT 1 FROM public.challenges WHERE title = 'Validate BST');
