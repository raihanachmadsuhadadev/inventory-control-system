<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rop_calculations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('hub_id')->nullable()->constrained('hubs')->cascadeOnUpdate()->nullOnDelete();
            $table->decimal('daily_demand', 15, 2);
            $table->unsignedInteger('lead_time_days');
            $table->unsignedInteger('safety_stock');
            $table->unsignedInteger('current_stock');
            $table->decimal('rop_result', 15, 2);
            $table->string('stock_status', 20);
            $table->foreignId('calculated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('calculated_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rop_calculations');
    }
};
