import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { supabase } from "../config/supabase.js";

export const signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const { data: existingAdmin } = await supabase
            .from("admin_users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const { data: admin, error } = await supabase
            .from("admin_users")
            .insert([
                {
                    email,
                    password_hash,
                },
            ])
            .select("id,email")
            .single();

        if (error) throw error;

        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.status(201).json({
            success: true,
            token,
            admin,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: admin, error } = await supabase
            .from("admin_users")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            admin.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        await supabase
            .from("admin_users")
            .update({
                last_login: new Date().toISOString(),
            })
            .eq("id", admin.id);

        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.status(200).json({
            success: true,
            token,
            admin: {
                id: admin.id,
                email: admin.email,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};