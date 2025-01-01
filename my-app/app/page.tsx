"use client"

import Image from "next/image";
import Auth from './components/Auth';
import { redirect } from "next/navigation";

export default function Home() {

    redirect('/signup');
}
