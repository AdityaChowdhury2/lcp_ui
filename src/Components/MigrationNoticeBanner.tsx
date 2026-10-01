
const showMigrationNotice = import.meta.env.VITE_SHOW_MIGRATION_NOTICE !== "false";

const MigrationNoticeBanner = () => {
  if (!showMigrationNotice) return null;

  return (
    // <div
    //   role="alert"
    //   className="mb-4 overflow-hidden rounded-md border-2 border-[#c0392b] bg-gradient-to-r from-[#fff5f5] via-[#ffe8e8] to-[#fff5f5] shadow-md ring-2 ring-[#e74c3c]/25"
    // >
    //   <div className="flex gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
    //     <span
    //       className="mt-0.5 shrink-0 rounded bg-[#c0392b] px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white sm:text-xs"
    //       aria-hidden
    //     >
    //       Notice
    //     </span>
    //     <div className="min-w-0 flex-1">
    //       <p className="text-sm font-extrabold uppercase tracking-wide text-[#922b21] sm:text-base">
    //         Important
    //       </p>
    //       <p className="mt-1.5 text-sm font-bold leading-relaxed text-[#641e16] sm:text-[15px]">
    //         {MIGRATION_NOTICE_MESSAGE}
    //       </p>
    //     </div>
    //   </div>
    // </div>
    <></>
  );
};

export default MigrationNoticeBanner;
