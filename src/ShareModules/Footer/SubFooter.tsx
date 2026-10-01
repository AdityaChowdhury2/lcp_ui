// SubFooter.jsx
import { Facebook, Twitter, Linkedin, Youtube } from "lucide-react";

export default function SubFooter() {
  return (
    <div className="relative z-20 bg-[#3b1f12] text-gray-300 py-4 border-t border-[#5a3a2b]">

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">

          {/* LEFT: App + Social */}
          {/* <div className="flex items-center gap-6"> */}

          {/* App Download */}
          {/* <a
              href="https://play.google.com/store/apps/details?id=com.contractorlicense"
              target="_blank"
            >
              <img
                src="https://lc.wb.gov.in/sites/all/themes/lcTheme/images/footer-apps-download.gif"
                alt="Download App"
                className="h-10 rounded shadow hover:scale-105 transition"
              />
            </a> */}

          {/* Social Icons */}
          {/* <div className="flex gap-3">

              <a
                href="https://www.facebook.com/westbengallabourcommissionerate"
                target="_blank"
                className="bg-[#5a3a2b] p-2 rounded-full hover:bg-[#ff8620] hover:text-white transition"
              >
                <Facebook size={16} />
              </a>

              <a
                href="#"
                className="bg-[#5a3a2b] p-2 rounded-full hover:bg-[#ff8620] hover:text-white transition"
              >
                <Twitter size={16} />
              </a>

              <a
                href="#"
                className="bg-[#5a3a2b] p-2 rounded-full hover:bg-[#ff8620] hover:text-white transition"
              >
                <span className="text-xs font-bold">G+</span>
              </a>

              <a
                href="#"
                className="bg-[#5a3a2b] p-2 rounded-full hover:bg-[#ff8620] hover:text-white transition"
              >
                <Linkedin size={16} />
              </a>

              <a
                href="https://www.youtube.com/channel/UCi1ekZTmQ11M3uQ0F9_dW5w"
                target="_blank"
                className="bg-[#5a3a2b] p-2 rounded-full hover:bg-[#ff8620] hover:text-white transition"
              >
                <Youtube size={16} />
              </a>

            </div> */}
          {/* </div> */}

          {/* CENTER: COPYRIGHT */}
          <div className="text-xs text-center">
            Copyright © 2015 - 2026 Commissionerate of Labour - All Rights Reserved
          </div>

        </div>

      </div>
    </div>
  );
}