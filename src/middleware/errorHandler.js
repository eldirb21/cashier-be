const errorHandler = (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] ERROR:`, err);

    // Prisma unique constraint violation
    if (err.code === "P2002") {
        const field = err.meta?.target?.[0] ?? "field";
        return res.status(409).json({
            success: false,
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} sudah terdaftar`,
        });
    }

    // Prisma record not found
    if (err.code === "P2025") {
        return res
            .status(404)
            .json({ success: false, message: "Data tidak ditemukan" });
    }

    return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
};

module.exports = { errorHandler };
