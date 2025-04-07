import Link from "next/link";

export default async function SlugPage({params}){
    const {id} = await params;
    return (
        <main>
            <h1>This is slug page under the params: {id}</h1>
            <Link href="./">Go back</Link>
        </main>
    )
}