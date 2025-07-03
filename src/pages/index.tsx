import Head from 'next/head'
import { DocsyChat } from '../components/DocsyChat'

export default function Home() {
  return (
    <>
      <Head>
        <title>Ask Docsy</title>
        <meta name="description" content="Search local government meeting notes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-white py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <DocsyChat />
        </div>
      </main>
    </>
  )
}