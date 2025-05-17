import React from "react";
import { Link } from "react-router-dom";

const ModuleIcon = () => {
  return (
    // Cần return JSX
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5" // camelCase cho JSX attributes
      stroke="currentColor"
      className="icon-ele" // Sử dụng className và đảm bảo class này được style trong SCSS
    >
      <path
        strokeLinecap="round" // camelCase
        strokeLinejoin="round" // camelCase
        d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
      />
    </svg>
  );
};
function ModuleElement({ data }) {
  return (
    <div className="module-ele">
      <Link
        to={`/module/${data._id}/${encodeURIComponent(data.name)}/${
          data.classId
        }`}
        className="module-element"
      >
        <span class="module-element-bg"></span>
        <ModuleIcon />
        <div className="module-data">
          <div className="module-additional-info">
            <div className="module-term">
              {data.termCount} flashcard{data.termCount !== 1 ? "s" : ""}
            </div>
            <div className="module-author">Nho Hoàng</div>
          </div>
          <div className="module-name">{data.name}</div>
        </div>
      </Link>
    </div>
  );
}
export default ModuleElement;
