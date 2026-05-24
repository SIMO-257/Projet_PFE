<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketType extends Model
{
    /** @use HasFactory<\Database\Factories\TicketTypeFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'description',
        'price',
        'duration_minutes',
        'is_reusable',
        'max_uses',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration_minutes' => 'integer',
            'is_reusable' => 'boolean',
            'max_uses' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Extract a localized string from a JSON-translated field (name, description).
     *
     * Handles all PDO return types:
     *  - array    (mysqlnd with FETCH_ASSOC decodes JSON objects to arrays)
     *  - stdClass (fallback object from some PDO configurations)
     *  - string   (raw JSON string when stringify fetches is enabled / no mysqlnd)
     */
    private function extractLocale(string|array|object|null $value): string
    {
        $translations = match (true) {
            is_array($value)               => $value,
            $value instanceof \stdClass     => (array) $value,
            is_string($value) && $value !== '' => json_decode($value, true) ?? [],
            default                        => [],
        };

        /** @var string $locale */
        $locale = app()->getLocale();

        return $translations[$locale]
            ?? $translations['fr']
            ?? $translations['en']
            ?? '';
    }

    /**
     * Accessor/mutator for the JSON-localized 'name' column.
     *
     * get: decodes the JSON/object into a locale-specific string.
     * set: encodes arrays to JSON; passes pre-encoded strings through.
     */
    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value): string => $this->extractLocale($value),
            set: fn(mixed $value): string => is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE),
        );
    }

    /**
     * Accessor/mutator for the JSON-localized 'description' column.
     */
    protected function description(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value): string => $this->extractLocale($value),
            set: fn(mixed $value): string => is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE),
        );
    }
}
