import { Link } from "react-router-dom";
const Breadcrumb = ({ pageName }) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="hidden text-title-md2 font-semibold text-[#728294] dark:text-white">
        {pageName}
      </h2>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium text-[#B6BEC7]" to="/">
              Home /
            </Link>
          </li>
          <li className="font-medium text-[#728294]">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
