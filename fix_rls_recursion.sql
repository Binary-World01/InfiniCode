-- DEFINITIVE RLS RECURSION FIX
-- This script completely removes all policies and re-applies a flattened security model to avoid recursion.

-- 1. Function to drop all policies on a table
CREATE OR REPLACE FUNCTION public.drop_all_policies(table_name text) RETURNS void AS $$
DECLARE
    policy_record record;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = table_name AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', policy_record.policyname, table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. Execute dropping for all related tables
SELECT public.drop_all_policies('profiles');
SELECT public.drop_all_policies('projects');
SELECT public.drop_all_policies('project_files');
SELECT public.drop_all_policies('project_collaborators');
SELECT public.drop_all_policies('challenges');
SELECT public.drop_all_policies('user_challenges');

-- 3. Simplified, Flattened Policies (No nested EXISTS where possible)

-- PROFILES: Everyone can read, owners can write
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- PROJECTS: Owners have full control, contributors can see
CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (
    auth.uid() = owner_id OR 
    is_public = true
);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "projects_delete" ON public.projects FOR DELETE USING (auth.uid() = owner_id);

-- PROJECT_COLLABORATORS: Everyone can see (to find rooms), anyone can join (for simplicity in this mock)
CREATE POLICY "collab_select" ON public.project_collaborators FOR SELECT USING (true);
CREATE POLICY "collab_insert" ON public.project_collaborators FOR INSERT WITH CHECK (true);
CREATE POLICY "collab_update" ON public.project_collaborators FOR UPDATE USING (auth.uid() = user_id);

-- PROJECT_FILES: This is where recursion often starts. We use a simpler join-less check if possible, 
-- or ensure the subqueries are on tables with 'true' select policies.
CREATE POLICY "files_select" ON public.project_files FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_files.project_id 
        AND (owner_id = auth.uid() OR is_public = true)
    )
);

CREATE POLICY "files_insert" ON public.project_files FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_id 
        AND owner_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.project_collaborators 
        WHERE project_id = project_files.project_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "files_update" ON public.project_files FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_files.project_id 
        AND owner_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.project_collaborators 
        WHERE project_id = project_files.project_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "files_delete" ON public.project_files FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_files.project_id 
        AND owner_id = auth.uid()
    )
);

-- CHALLENGES
CREATE POLICY "challenges_select" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "user_challenges_select" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_challenges_insert" ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Cleanup
DROP FUNCTION public.drop_all_policies(text);
