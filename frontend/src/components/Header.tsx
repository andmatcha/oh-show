import Url from "@/constants/url";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();
  return (
    <header className="w-full fixed h-16 bg-blue-950">
      <div className="relative w-full h-full flex justify-center items-center">
        <p className="text-lg font-bold text-white">王将シフト</p>
        {pathname !== Url.top && pathname !== Url.login ? (
          <Link
            href={Url.top}
            className="absolute top-1/2 -translate-y-1/2 right-4 text-white text-sm"
          >
            TOPに戻る
          </Link>
        ) : (
          <></>
        )}
      </div>
    </header>
  );
};

export default Header;
