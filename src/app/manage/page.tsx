import { prisma } from '@/lib/prisma';
import { LabelPrinter } from '@/components/LabelPrinter';

async function getStats() {
  const totalParts = await prisma.part.count();
  
  const consumables = await prisma.part.count({
    where: { partType: 'consumable' }
  });
  
  const components = await prisma.part.count({
    where: { partType: 'component' }
  });

  // Get counts by typt
  const typtCounts = await prisma.part.groupBy({
    by: ['typt'],
    _count: true,
  });

  // Get all parts for label printing
  const allParts = await prisma.part.findMany({
    select: {
      id: true,
      partNumber: true,
      name: true,
      partType: true,
      typt: true,
      location: true,
      quantity: true,
    },
    orderBy: [
      { partType: 'asc' },
      { partNumber: 'asc' }
    ]
  });

  return {
    totalParts,
    consumables,
    components,
    typtCounts,
    allParts
  };
}

export default async function ManagePage() {
  const stats = await getStats();

  return (
    <div className="max-w-7xl mx-auto mt-24 md:mt-32 p-4 md:p-8">
      <h1 className="text-2xl md:text-4xl font-bold text-white mb-8">Inventory Management</h1>
      
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#181A1B] rounded-xl p-6 border-2 border-[#e74c3c] shadow-lg">
          <h2 className="text-lg md:text-xl text-gray-400 mb-2">Total Parts</h2>
          <p className="text-3xl md:text-4xl font-bold text-[#e74c3c]">{stats.totalParts}</p>
        </div>
        
        <div className="bg-[#181A1B] rounded-xl p-6 border-2 border-[#e74c3c] shadow-lg">
          <h2 className="text-lg md:text-xl text-gray-400 mb-2">Components</h2>
          <p className="text-3xl md:text-4xl font-bold text-[#e74c3c]">{stats.components}</p>
        </div>
        
        <div className="bg-[#181A1B] rounded-xl p-6 border-2 border-[#e74c3c] shadow-lg">
          <h2 className="text-lg md:text-xl text-gray-400 mb-2">Consumables</h2>
          <p className="text-3xl md:text-4xl font-bold text-[#e74c3c]">{stats.consumables}</p>
        </div>
      </div>      {/* Typt Distribution */}
      <div className="bg-[#181A1B] rounded-xl p-6 border-2 border-[#e74c3c] shadow-lg mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Parts by Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.typtCounts.map((typtStat) => (
            <div key={typtStat.typt} className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg text-gray-300 mb-2">{typtStat.typt}</h3>
              <p className="text-2xl font-bold text-[#e74c3c]">{typtStat._count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Label Printer */}
      <LabelPrinter parts={stats.allParts} />
    </div>
  );
}
