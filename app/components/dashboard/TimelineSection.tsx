import { TimelineItem } from "../../../types/types";

type Props = {
  timeline: TimelineItem[];
};

export default function TimelineSection({ timeline }: Props) {
  return (
    <section className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="font-semibold text-[#5F021F] mb-4">
        Process History
      </h2>

      <ol className="relative border-l border-gray-300">
        {timeline.map((item) => (
          <li key={item.time} className="mb-6 ml-4 relative">
            <span className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-[#FFA500] border-2 border-white shadow" />
            <time className="text-xs text-gray-400 uppercase">
              {item.time}
            </time>
            <h3 className="font-semibold text-[#5F021F]">
              {item.title}
            </h3>
            <p className="text-gray-600">{item.content}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}