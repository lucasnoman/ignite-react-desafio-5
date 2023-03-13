import Image from 'next/image';
import Link from 'next/link';
import { ReactElement } from 'react';
import style from './header.module.scss';

export default function Header(): ReactElement {
  // TODO
  return (
    <header className={style.container}>
      <Link href="/">
        <Image src="/Logo.svg" width={239} height={27} alt="logo" />
      </Link>
    </header>
  );
}
