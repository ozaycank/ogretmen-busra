import { prisma } from "@/infrastructure/database/prisma";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { PostStatus } from "@prisma/client";
import { createNewsExcerpt } from "@/modules/news/utils/news-content";

export default async function NewsSection() {
  const news = await prisma.news.findMany({
    where: {
      status: PostStatus.PUBLISHED,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 2,
  });

  if (news.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {news.map((item) => {
        const excerpt = createNewsExcerpt(item.content, 280);

        return (
          <article
            key={item.id}
            className="bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-lg transition-shadow group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold">
                  {item.label}
                </span>

                <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                  <Calendar size={14} />

                  {new Date(
                    item.publishedAt ?? item.createdAt,
                  ).toLocaleDateString("tr-TR")}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 leading-tight mb-3 group-hover:text-sky-600 transition-colors">
                {item.title}
              </h3>

              {excerpt && (
                <p className="text-slate-500 line-clamp-3 text-sm">{excerpt}</p>
              )}
            </div>

            <Link
              href={`/haberler/${item.slug}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700"
            >
              Devamını Oku
              <ArrowRight size={16} />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
