"use client"

import Image from "next/image"

export default function Custom404() {
    return (
        <div className="flex flex-col items-center justify-center h-screen relative">
            <section className="flex flex-col items-center justify-center">
                <Image 
                    src={"https://media1.tenor.com/m/boye5iYFWW0AAAAd/txacky.gif"} 
                    alt={"404 not found"} 
                    width={1920} 
                    height={1080} 
                    className="rounded-xl brightness-75" 
                    draggable={"false"} 
                />
            </section>
            <h1 className="text-4xl font-bold text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-lg">
                404 - Page Not Found
            </h1>
            <p className="text-center absolute bottom-10 text-white drop-shadow-lg">
                The page you are looking for does not exist.
            </p>
        </div>
    )
}