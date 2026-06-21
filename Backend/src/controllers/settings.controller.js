import { supabase } from "../config/supabase.js";

export const getSettings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("settings")
            .select("*")
            .limit(1)
            .single();

        if (error) throw error;

        res.status(200).json({
            success: true,
            settings: data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const {
            site_name,
            whatsapp_number,
            instagram_url,
            facebook_url,
            email,
        } = req.body;

        const { data: existingSettings } = await supabase
            .from("settings")
            .select("id")
            .limit(1)
            .single();

        let result;

        if (existingSettings) {
            const { data, error } = await supabase
                .from("settings")
                .update({
                    site_name,
                    whatsapp_number,
                    instagram_url,
                    facebook_url,
                    email,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existingSettings.id)
                .select()
                .single();

            if (error) throw error;

            result = data;
        } else {
            const { data, error } = await supabase
                .from("settings")
                .insert([
                    {
                        site_name,
                        whatsapp_number,
                        instagram_url,
                        facebook_url,
                        email,
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            result = data;
        }

        res.status(200).json({
            success: true,
            settings: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};