import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6 transition-colors">
          HOME 가계부
        </h1>
        <p className="text-lg leading-8 text-gray-600 dark:text-gray-300 mb-8 transition-colors">
          관리자 승인을 통해 이용할 수 있는 안전한 가계부 웹 프로그램입니다.
        </p>
        <div className="flex items-center justify-center gap-x-6">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            로그인
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600"
          >
            회원가입 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
