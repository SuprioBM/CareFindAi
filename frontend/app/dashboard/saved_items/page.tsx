'use client';

import SavedItemsContent from '../../../components/dashboard/savedItemsComponent';

export default function SavedItemsPage() {
  return (
    <div className="px-4 sm:px-6 md:px-12 py-6 md:py-10 flex justify-center">
      <div className="flex flex-col w-full max-w-[1400px]">
        <SavedItemsContent />
      </div>
    </div>
  );
}