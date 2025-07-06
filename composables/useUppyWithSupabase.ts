import Uppy from "@uppy/core";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types.ts";

let uppyInstance: Uppy | null = null;

export const useUppyWithSupabase = ({ bucketName }: { bucketName: string }) => {
    const { supabase } = useSupabase();
};
