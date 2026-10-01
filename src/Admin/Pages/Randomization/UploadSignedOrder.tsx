import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

/* =========================
   TYPES
========================= */
interface UploadForm {
    signedOrder: FileList;
}

/* =========================
   VALIDATION
========================= */
const schema = yup.object({
    signedOrder: yup
        .mixed<FileList>()
        .test("fileRequired", "Please upload signed order", value => {
            return value instanceof FileList && value.length > 0;
        })
        .required(),
});

/* =========================
   COMPONENT
========================= */
const UploadSignedOrder: React.FC = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UploadForm>({
        resolver: yupResolver(schema),
    });

    const onSubmit = (data: UploadForm) => {
        const file = data.signedOrder[0];
        console.log("Uploading:", file);
        // API call here
    };

    return (
        <div className="min-h-screen px-6 py-4">

            {/* PAGE TITLE */}
            <h1 className="text-[20px] font-semibold text-[#333] mb-6">
                Upload Signed Order
            </h1>

            {/* DOWNLOAD BUTTON */}
            <div className="mb-5">
                <a
                    href="/generate-random-order/69/DLC-ORDER"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#7cb51c] text-white px-4 py-2 rounded text-sm font-semibold inline-block"
                >
                    DOWNLOAD SYSTEM GENERATED ORDER
                </a>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Upload Signed Order */}
                <div className="text-sm font-semibold text-[#333] mb-1">
                    Upload Signed Order
                </div>

                <input
                    type="file"
                    {...register("signedOrder")}
                    style={{
                        border: "none",
                        padding: 0,
                        background: "transparent",
                        width: "auto",
                        fontSize: "13px",
                        color: "#000",
                    }}
                    className="file:mr-2 file:px-2 file:py-[1px] file:border file:border-[#999] file:bg-[#eee] file:text-black file:text-sm file:cursor-pointer"
                />

                {errors.signedOrder && (
                    <p className="text-red-600 text-sm mt-1">
                        {errors.signedOrder.message}
                    </p>
                )}

                {/* Upload button */}
                <div>
                    <button
                        type="submit"
                        className="border border-[#aaa] bg-[#f5f5f5] px-4 py-1 text-sm"
                    >
                        Upload Order
                    </button>
                </div>

                {/* Back Button */}
                <div className="pt-3">
                    <button
                        type="button"
                        onClick={() => navigate("/randomization-previous-list")}
                        className="bg-[#7cb51c] text-white px-4 py-2 rounded text-sm font-semibold"
                    >
                        BACK TO PREVIOUS LIST
                    </button>
                </div>

            </form>
        </div>
    );
};

export default UploadSignedOrder;
