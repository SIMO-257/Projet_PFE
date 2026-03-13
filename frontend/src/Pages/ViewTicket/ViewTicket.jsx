import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, MoreVertical, CheckCircle, Ticket, Euro, Clock, Calendar, List, Import } from 'lucide-react';
import styles from '../../Styles/ViewTicket.module.css'

export default function DetailTicket() {
    const {id} = useParams();
    const ListTickets = useSelector(state=>state.Tickets); 
    const T = ListTickets.find(t => t.id == id);
    console.lo
  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
            <Link to="/">
                <ArrowLeft size={24} className={styles.headerIcon} />
            </Link>
          <h1 className={styles.headerTitle}>Détails du billet</h1>
        </div>

        {/* Active Status Card */}
        <div className={styles.statusCard}>
          <CheckCircle size={20} color="#fff" />
          <div>
            <div className={styles.statusTitle}></div>
            <div className={styles.statusSubtitle}>
              Valide jusqu'à {T.validTime}
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className={styles.detailsCard}>
          {/* Type */}
          <div className={styles.detailItem}>
            <div className={styles.detailHeader}>
              <div className={styles.iconContainer}>
                <Ticket size={16} color="#1a1f3a" />
              </div>
              <span className={styles.detailLabel}>Type</span>
            </div>
            <div className={styles.detailValue}>{T.title}</div>
          </div>

          {/* Price */}
          <div className={styles.detailItem}>
            <div className={styles.detailHeader}>
              <div className={styles.iconContainer}>
                <Euro size={16} color="#1a1f3a" />
              </div>
              <span className={styles.detailLabel}>Prix</span>
            </div>
            <div className={styles.detailValue}>{T.price}</div>
          </div>

          {/* Validity */}
          <div className={styles.detailItem}>
            <div className={styles.detailHeader}>
              <div className={styles.iconContainer}>
                <Clock size={16} color="#1a1f3a" />
              </div>
              <span className={styles.detailLabel}>Validité</span>
            </div>
            <div className={styles.detailValue}>{T.validPeriod}</div>
          </div>

          {/* Purchase Date */}
          <div className={styles.detailItem}>
            <div className={styles.detailHeader}>
              <div className={styles.iconContainer}>
                <Calendar size={16} color="#1a1f3a" />
              </div>
              <span className={styles.detailLabel}>Date d'achat</span>
            </div>
            <div className={styles.detailValue}>27 janvier 2025, 17:12</div>
          </div>

         
        </div>

        {/* Footer Link */}
        <div className={styles.footer}>
          <a href="#" className={styles.footerLink}>
            Problème avec votre billet?
          </a>
        </div>
      </div>
    </div>
  );
}