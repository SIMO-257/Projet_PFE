<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'type'       => $this->type,
            'severity'   => $this->severity,
            'title'      => $this->title,
            'body'       => $this->body,
            'meta'       => $this->meta,
            'is_read'    => $this->is_read,
            'read_at'    => $this->read_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'time_ago'   => $this->created_at->diffForHumans(),
        ];
    }
}
