"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, User, BookOpen, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchBlogDetail() {
      try {
        const res = await api.get(`/store/blogs/${slug}`);
        if (res.data && res.data.success) {
          setBlog(res.data.data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-24 flex justify-center items-center">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-24 text-center px-4">
        <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Article Not Found</h2>
        <p className="text-slate-400 text-xs mt-1.5 mb-6">The blog post you are looking for does not exist or has been unpublished.</p>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 bg-brand-600 text-white hover:bg-brand-700 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <ArrowLeft size={14} /> Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 select-none animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Back Link */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 text-xs font-bold uppercase tracking-wider mb-8 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Blogs
        </Link>

        {/* Article Container */}
        <article className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Header Image */}
          {blog.imageUrl && (
            <div className="aspect-[21/9] w-full bg-slate-100 border-b border-slate-100 overflow-hidden relative">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Body */}
          <div className="p-6 md:p-12">
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-6 border-b border-slate-50 pb-6">
              <div className="flex items-center gap-1.5 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-100">
                <User size={14} className="text-slate-400" />
                <span className="text-slate-700">By {blog.author || "Administrator"}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-100">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-slate-700">
                  {new Date(blog.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-8">
              {blog.title}
            </h1>

            {/* Text content split by paragraphs */}
            <div className="text-slate-600 text-sm md:text-base leading-relaxed font-medium space-y-6">
              {blog.content.split("\n").filter((p: string) => p.trim() !== "").map((para: string, idx: number) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

          </div>
        </article>
      </div>
    </div>
  );
}
