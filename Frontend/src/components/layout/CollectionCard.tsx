"use client";

import { Notch, type NotchItem } from "@/components/ui/notch";
import { useState } from "react";

interface CollectionCardProps {
  title: string;
  description: string;
  image: string;
}

export function CollectionCard({
  title,
  description,
  image,
}: CollectionCardProps) {
  const [action, setAction] = useState("view");

  const items: NotchItem[] = [
    {
      id: "actions",
      label: "Collection",
      value: action,
      onChange: (id) => setAction(id),
      options: [
        {
          id: "view",
          label: "View",
        },
        {
          id: "video",
          label: "Video",
        },
        {
          id: "whatsapp",
          label: "WhatsApp",
        },
      ],
    },
  ];

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[32px] bg-[#7C5CFC] p-1">
        <img
          src={image}
          alt={title}
          className="h-[380px] w-full rounded-[28px] object-cover"
        />

        <div className="p-6 text-center text-white">
          <h3 className="text-2xl font-bold">{title}</h3>

          <p className="mt-2 text-white/80">
            {description}
          </p>
        </div>
      </div>

      <Notch items={items} position="bottom" />
    </div>
  );
}