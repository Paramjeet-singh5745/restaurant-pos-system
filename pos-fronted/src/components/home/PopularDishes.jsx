/* =========================================
   SINGLE DISH ITEM COMPONENT
========================================= */
const DishItem = ({ dish, index }) => {
  const name = dish?.item_name || dish?.name || "Unknown Dish";
  const orders = dish?.total_orders || dish?.orders || 0;

  return (
    <div className="flex items-center gap-4 bg-[#242424] hover:bg-[#2d2d2d] transition-all duration-300 rounded-xl px-4 py-3">

      {/* INDEX */}
      <div className="text-white font-bold text-base sm:text-lg w-8">
        {index + 1 < 10 ? `0${index + 1}` : index + 1}
      </div>

      {/* ICON CIRCLE */}
      <div className="w-12 h-12 flex items-center justify-center bg-[#333] rounded-full text-white font-bold text-lg flex-shrink-0">
        {name.charAt(0).toUpperCase()}
      </div>

      {/* DISH DETAILS */}
      <div className="flex-1">
        <h2 className="text-white font-semibold text-sm sm:text-base tracking-wide">
          {name}
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">
          Orders: {orders}
        </p>
      </div>
    </div>
  );
};

/* =========================================
   MAIN POPULAR DISHES COMPONENT
========================================= */
const PopularDishes = ({ popularDishes = [] }) => {
  const dishes = Array.isArray(popularDishes)
    ? popularDishes
    : [];

  return (
    <div className="w-full mt-8">
      <div className="bg-[#1f1f1f] border border-gray-700 rounded-2xl shadow-md">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-5 py-4 border-b border-gray-700">
          <h1 className="text-white text-lg sm:text-xl font-semibold tracking-wide">
            Popular Dishes
          </h1>

          <button className="text-blue-400 text-sm sm:text-base font-medium hover:underline">
            View All
          </button>
        </div>

        {/* ================= DISH LIST ================= */}
        <div className="max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto px-5 py-4 space-y-4">

          {dishes.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-gray-400 text-sm sm:text-base">
                No popular dishes found.
              </p>
            </div>
          ) : (
            dishes.map((dish, index) => (
              <DishItem
                key={dish?.item_id || index}
                dish={dish}
                index={index}
              />
            ))
          )}

        </div>
      </div>
    </div>
  );
};

export default PopularDishes;