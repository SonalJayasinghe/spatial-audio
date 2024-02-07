import Link from "next/link";

const Footer = () => {
  return (
    <footer className="rounded-t-md">
      <div className="bg-slate-800 p-2 text-center items-center flex-col flex">
        <p className="text-slate-100 justify-center text-sm">
          {" "}
          Developed by{" "}
          <Link
            href={"https://www.linkedin.com/in/sonaljayasinghe"}
            target={"_blank"}
          >
            Sonal Jayasinghe{" "}
          </Link>
          | Spatial Audio Expetiment 1.0.0
        </p>
      </div>
    </footer>
  );
};

export default Footer;
