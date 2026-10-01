import { FRONTEND_BASE, IMAGE_BASE } from "@/constants/constants";
// import React, { type FC } from "react";
// import "./FooterStyle.css";
// // import { Separator } from "@/Components/ui/separator"; // ⬅ lowercase `components`
// import { Phone, Mail, Star } from "lucide-react";
// import { Separator } from '../../Components/ui/separator';

// const Footer: FC = () => {
//   return (
//     <footer className={`bg-[url('${IMAGE_BASE}ftr-bg.jpg')] text-[#b9b9b9] pt-10 pb-6`}>
//       <div className="max-w-6xl mx-auto px-4">
//         {/* Top Section */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
//           {/* Column 1 */}
//           <div>
//             <h2 className="text-xl font-semibold mb-2 text-white uppercase">
//               Contact Us
//             </h2>
//             <ul>
//               <li>11th Floor, New Secretariat Building,</li>
//               <li>1, K.S. Roy Road, BBD Bagh,</li>
//               <li className="mb-4">Kolkata, West Bengal 700001</li>
//               <li>
//                 <a
//                   href="tel:+9118001030009"
//                   className="flex gap-2 text-2xl items-center text-[#ff8620] font-semibold hover:text-white blink"
//                 >
//                   <Phone
//                     size={28}
//                     fill="#ff8620"
//                     stroke="none"
//                     className="hover:fill-white"
//                   />
//                   1800-103-0009
//                 </a>
//               </li>
//             </ul>

//             <div className="counter grid grid-cols-1 sm:grid-cols-2 gap-6 text-center py-6">
//               {/* Item 1 */}
//               <div>
//                 <div className={`bg-[url('${IMAGE_BASE}ftr-counter-box.png')] text-white h-[25px] w-fit`}>
//                   <span className="text-2xl font-bold text-[#ff8620]">
//                     97,553
//                   </span>
//                 </div>
//                 <p className="stat-detail text-sm mt-5">
//                   Submitted <br /> Application
//                 </p>
//               </div>

//               {/* If you want second stat, uncomment and adapt */}
//               {/* <div>
//                 <span className="text-2xl font-bold text-[#ff8620]">
//                   86,824
//                 </span>
//                 <p className="stat-detail text-sm mt-2">
//                   Issued <br /> Certificate
//                 </p>
//               </div> */}
//             </div>
//           </div>

//           {/* Column 2 */}
//           <div>
//             <h2 className="text-xl font-semibold mb-4 text-white">
//               Quick Links
//             </h2>
//             <ul className="space-y-2">
//               <li>Privacy Policy</li>
//               <li>Terms &amp; Conditions</li>
//               <li>FAQ</li>
//               <li>Support</li>
//             </ul>
//           </div>

//           {/* Column 3 */}
//           <div>
//             <h2 className="text-xl font-semibold mb-4 text-white">Contact</h2>
//             <ul className="space-y-3">
//               <li className="flex items-center gap-2">
//                 <Phone size={18} /> +91 90000 00000
//               </li>
//               <li className="flex items-center gap-2">
//                 <Mail size={18} /> support@example.com
//               </li>
//             </ul>
//           </div>

//           {/* Column 4: Social Icons */}
//           <div>
//             <h2 className="text-xl font-semibold mb-4 text-white">
//               Follow Us
//             </h2>
//             <div className="flex gap-4">
//               <Star />
//             </div>
//           </div>
//         </div>

//         {/* Separator From shadcn */}
//         <Separator className="my-8 bg-gray-600" />

//         {/* Bottom Section */}
//         <div className="text-center text-sm text-gray-400">
//           © {new Date().getFullYear()} Your Company Name. All Rights Reserved.
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

// Footer.jsx




// Footer.jsx
import { Phone, Home, Book, HelpCircle, Network } from "lucide-react";
import SubFooter from "./SubFooter";


export default function Footer() {
  return (
    <footer className="relative text-[#d1d1d1] pt-12 pb-6 text-sm">

      {/* ✅ Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${IMAGE_BASE}ftr-bg.jpg')`,
        }}
      />

      {/* ✅ Overlay for readability */}
      <div className="absolute inset-0 bg-[#2b1b14]/90" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* CONTACT */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4 tracking-wide">
              CONTACT US
            </h4>

            <ul className="space-y-1 leading-6">
              <li>11th Floor, New Secretariat Building,</li>
              <li>1, K.S. Roy Road, BBD Bagh,</li>
              <li>Kolkata, West Bengal 700001</li>

              <li className="mt-3">
                <a
                  href="tel:+9118001030009"
                  className="flex items-center gap-2 text-[#ff8620] text-xl font-semibold hover:text-white transition"
                >
                  <Phone size={18} /> 1800-103-0009
                </a>
              </li>
            </ul>

            {/* COUNTERS */}
            <div className="flex gap-6 mt-6">
              <div className="text-center">
                <div className="bg-[#5a3a2b] px-4 py-2 rounded shadow">
                  <span className="text-xl font-bold text-[#ff8620]">
                    104710
                  </span>
                </div>
                <p className="text-xs mt-2">Submitted<br />Application</p>
              </div>

              <div className="text-center">
                <div className="bg-[#5a3a2b] px-4 py-2 rounded shadow">
                  <span className="text-xl font-bold text-[#ff8620]">
                    93548
                  </span>
                </div>
                <p className="text-xs mt-2">Issued<br />Certificate</p>
              </div>
            </div>
          </div>

          {/* LINKS */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4 tracking-wide">
              LINKS
            </h4>

            <ul className="space-y-3 border-t border-dashed border-gray-500 pt-3">
              <li><a href="/" className="flex gap-2 hover:text-white transition"><Home size={16} /> Home</a></li>
              <li><a href={`${FRONTEND_BASE}/`} className="flex gap-2 hover:text-white transition" target="_blank"><Book size={16} /> Labour Department</a></li>
              {/* <li><a href="/about-us" className="flex gap-2 hover:text-white transition"><Book size={16} /> About Us</a></li>
              <li><a href="/faq" className="flex gap-2 hover:text-white transition"><HelpCircle size={16} /> FAQ</a></li>
              <li><a href="/privacy-policy" className="flex gap-2 hover:text-white transition"><Book size={16} /> Privacy Policy</a></li>
              <li><a href="/sitemap" className="flex gap-2 hover:text-white transition"><Network size={16} /> Site Map</a></li>
              <li><a href="/contactinfo" className="flex gap-2 hover:text-white transition"><Phone size={16} /> Contact Us</a></li> */}
            </ul>
          </div>

          {/* DOWNLOAD APP */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4 tracking-wide">
              DOWNLOAD APP
            </h4>

            <div className="space-y-4">
              <div>
                <a href="#" target="_blank">
                  <img
                    src={`${IMAGE_BASE}btn-inspection-process.png`}
                    className="rounded shadow hover:scale-105 transition"
                  />
                </a>
              </div>

              <div>
                <a href="#" target="_blank">
                  <img
                    src={`${IMAGE_BASE}btn-contractor-licence.png`}
                    className="rounded shadow hover:scale-105 transition"
                  />
                </a>
              </div>

              {/* <h4 className="text-white text-md font-semibold mt-4">
                Best Viewed With
              </h4>

              <img
                src={`${IMAGE_BASE}best-view-browser.png`}
                className="rounded"
              /> */}
            </div>
          </div>

          {/* DIGITAL MEDIA */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4 tracking-wide">
              DIGITAL MEDIA
            </h4>

            <div className="space-y-4">
              <img
                src={`${IMAGE_BASE}ftr-Digital-India.png`}
                className="rounded shadow hover:scale-105 transition"
              />

              <img
                src={`${IMAGE_BASE}ftr-Digital-India-Awards.png`}
                className="rounded shadow hover:scale-105 transition"
              />

              <img
                src={`${IMAGE_BASE}ftr-Process-Flow.png`}
                className="rounded shadow hover:scale-105 transition"
              />
            </div>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-10 text-center text-xs text-gray-400 space-y-2">
          <p>
            All efforts have been made to make the information as accurate as possible.
            Contents of this site are owned and maintained by the Office of the Labour Commissionerate.
          </p>
          <p>Last Updated On : 29-04-2026</p>
        </div>

      </div>
      <div className="relative z-10 mt-6">
        <SubFooter />
      </div>
    </footer>
  );
}