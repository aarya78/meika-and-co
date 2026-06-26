import { supabase } from "../config/supabase.js";

const parseNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true" || value === "1";
  }

  return Boolean(value);
};

const parseMediaItems = (media) => {
  if (!media) {
    return [];
  }

  if (Array.isArray(media)) {
    return media;
  }

  if (typeof media === "string") {
    try {
      const parsed = JSON.parse(media);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const buildProductPayload = (body) => ({
  name: body.name?.trim(),
  slug: body.slug?.trim(),
  size: body.size?.trim() || null,
  description: body.description?.trim() || null,
  price: parseNumber(body.price),
  featured: parseBoolean(body.featured),
  is_active: body.is_active === undefined ? true : parseBoolean(body.is_active),
  category_id: body.category_id || null,
});

const mediaInsertShapes = (productId, mediaItems) => [
  mediaItems.map((item) => ({
    product_id: productId,
    media_url: item.media_url ?? item.url,
    media_type: item.media_type ?? item.type,
  })),
  mediaItems.map((item) => ({
    product_id: productId,
    url: item.media_url ?? item.url,
    type: item.media_type ?? item.type,
  })),
];

const syncProductImages = async (productId, mediaItems) => {
  const normalizedItems = mediaItems
    .map((item) => ({
      media_url: item.media_url ?? item.url,
      media_type: item.media_type ?? item.type,
    }))
    .filter((item) => item.media_url && item.media_type);

  const { error: deleteError } = await supabase
    .from("product_media")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    throw deleteError;
  }

  if (!normalizedItems.length) {
    return;
  }

  let lastError = null;

  for (const shape of mediaInsertShapes(productId, normalizedItems)) {
    const { error } = await supabase.from("product_media").insert(shape);

    if (!error) {
      return;
    }

    lastError = error;
  }

  if (lastError) {
    throw lastError;
  }
};

const fetchProductById = async (id) => {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories(*),
      product_media(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const createProduct = async (req, res) => {
  try {
    const productPayload = buildProductPayload(req.body);
    const mediaItems = parseMediaItems(req.body.media);

    const { data, error } = await supabase
      .from("products")
      .insert([productPayload])
      .select()
      .single();

    if (error) throw error;

    await syncProductImages(data.id, mediaItems);

    const product = await fetchProductById(data.id);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories(*),
        product_media(*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await fetchProductById(id);
    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const mediaItems = parseMediaItems(req.body.media);
    const productPayload = buildProductPayload(req.body);

    const { error } = await supabase
      .from("products")
      .update({
        ...productPayload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    if (req.body.media !== undefined) {
      await syncProductImages(id, mediaItems);
    }

    const product = await fetchProductById(id);

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { error: mediaDeleteError } = await supabase
      .from("product_media")
      .delete()
      .eq("product_id", id);

    if (mediaDeleteError) throw mediaDeleteError;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const uploadProductImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    const fileName = `${Date.now()}-${file.originalname}`;

    const { data, error } = await supabase.storage
      .from("products")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("products")
      .getPublicUrl(data.path);

    res.json({
      url: publicUrl,
      type: file.mimetype.startsWith("video/") ? "video" : "image",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
