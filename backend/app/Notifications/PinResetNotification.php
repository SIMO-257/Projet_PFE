<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PinResetNotification extends Notification
{
    public function __construct(
        private readonly string $newPin
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre code PIN a été réinitialisé')
            ->greeting('Bonjour !')
            ->line('Vous avez demandé une réinitialisation de votre code PIN.')
            ->line('Votre nouveau code PIN est :')
            ->line("**{$this->newPin}**")
            ->line('Nous vous recommandons de changer ce code après vous être connecté.')
            ->line('Si vous n\'avez pas demandé cette réinitialisation, veuillez contacter le support immédiatement.');
    }
}
