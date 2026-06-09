"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, User, ChevronRight, Loader2, BookOpen } from "lucide-react";
import api from "@/lib/api";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await api.get("/store/blogs");
        if (res.data && res.data.success) {
          setBlogs(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching blogs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 select-none animate-fade-in">

      {/* Grid section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="animate-spin text-brand-600" size={32} />
          </div>
        ) : blogs.length === 0 ? (
          <div className="py-20 text-center border border-slate-100 bg-white rounded-3xl">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="font-bold text-slate-800 text-sm">No blog posts found</h3>
            <p className="text-slate-400 text-xs mt-1">Check back later for new articles!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="group flex flex-col bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-300 overflow-hidden h-full"
              >
                <Link href={`/blogs/${blog.slug}`} className="flex flex-col h-full">
                  {/* Blog Image */}
                  <div className="aspect-[16/10] bg-slate-50 relative overflow-hidden shrink-0">
                    {blog.imageUrl ? (
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                        <BookOpen size={32} />
                      </div>
                    )}
                    {/* Author Badge */}
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-extrabold px-2.5 py-1 rounded-xl border border-slate-200/50 shadow-sm capitalize">
                      {blog.author || "Guest"}
                    </span>
                  </div>

                  {/* Blog Details */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3">
                      <Calendar size={12} />
                      <span>
                        {new Date(blog.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-base line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors duration-300 mb-3">
                      {blog.title}
                    </h3>
                    
                    <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed mb-6 font-normal">
                      {blog.content}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-brand-600 text-xs font-semibold uppercase tracking-wider">
                      <span>Read Full Article</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
