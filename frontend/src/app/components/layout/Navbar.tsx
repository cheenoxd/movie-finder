import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import Search from "../ui/search-bar"
export default function Navbar() {
  return (
    <div className="flex bg-blue-200 w-full mx-auto py-10 px-10 justify-between items-center text-3xl">
      <Link href="/" className="flex bg-gray-200 p-2 inline-block">
        test
      </Link>      
        <ul className="flex space-x-4">
          <li>
            <Link href="/home" className="flex bg-gray-200 inline-block p-2">
              Home
            </Link>
          </li>
          <li>
            <Link href="/profile" className="flex bg-gray-200 inline-block p-2">
              Profile
            </Link>
          </li>
          <li>
            <Link
              href="/recommendation"
              className="flex bg-gray-200 inline-block p-2"
            >
              Recommendation
            </Link>
          </li>
        </ul>
     
            <Button className="text-3xl inline-block p-2">Sign In</Button>

       
    </div>

    //profile
    //recomendations
    //search bar
    //home
  );
}
