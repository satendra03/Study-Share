import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';

export function useRouterWithProgress() {
  const router = useRouter();

  const push = (href: string) => {
    NProgress.start();
    router.push(href);
  };

  const replace = (href: string) => {
    NProgress.start();
    router.replace(href);
  };

  const back = () => {
    NProgress.start();
    router.back();
  };

  const forward = () => {
    NProgress.start();
    router.forward();
  };

  const refresh = () => {
    NProgress.start();
    router.refresh();
  };

  return {
    ...router,
    push,
    replace,
    back,
    forward,
    refresh,
  };
}