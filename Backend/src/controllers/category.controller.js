import { supabase } from "../config/supabase.js";

export const createCategory = async (req, res) => {
    try {
        const { name, slug } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Name and slug are required",
            });
        }

        const { data, error } = await supabase
            .from("categories")
            .insert([
                {
                    name,
                    slug,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            category: data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        res.status(200).json({
            success: true,
            categories: data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getSingleCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        res.status(200).json({
            success: true,
            category: data,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "Category not found",
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const { name, slug, description } = req.body;

        const { data, error } = await supabase
            .from("categories")
            .update({
                name,
                slug,
                description,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({
            success: true,
            category: data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", id);

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};