import Head from 'next/head';
import DocsyChat from '@/components/DocsyChat';

export default function Home() {
  return (
    <>
      <Head>
        <title>Ask Docsy - Your Government Services Assistant</title>
        <meta name="description" content="Ask Docsy anything about government programs, benefits, and services" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/docsy.svg" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <DocsyChat />
      </main>
    </>
  );
}