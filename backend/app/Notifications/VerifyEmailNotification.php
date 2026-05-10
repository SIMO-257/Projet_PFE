<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailNotification extends Notification
{
    use Queueable;

    public function __construct(private string $code) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre code de vérification — CasaWay')
            ->greeting('Bonjour ' . $notifiable->first_name . ' !')
            ->line('Merci de vous être inscrit sur CasaWay.')
            ->line('Voici votre code de vérification à 6 chiffres :')
            ->line('**' . $this->code . '**')
            ->line('Veuillez saisir ce code sur l\'application pour vérifier votre adresse email.')
            ->line('Ce code expirera dans 60 minutes.')
            ->line('Si vous n\'avez pas créé de compte, ignorez cet email.')
            ->salutation('L\'équipe CasaWay');
    }
}
