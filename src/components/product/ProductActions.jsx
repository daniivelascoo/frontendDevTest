import { useEffect, useId, useMemo, useState } from 'react';
import { OptionSelector } from './OptionSelector.jsx';
import { Button } from '../ui/Button.jsx';
import { getPurchaseOptions } from '../../lib/productSpecs.js';
import { getPurchaseAvailability } from '../../lib/availability.js';
import { formatPrice } from '../../lib/format.js';
import { useCart } from '../../context/cartContext.js';
import styles from './ProductActions.module.css';

/**
 * Acciones de compra: selectores de almacenamiento y color, y botón de añadir.
 *
 * El enunciado exige que los selectores se muestren aunque solo haya una
 * opción y que en ese caso venga preseleccionada. Aquí se preselecciona
 * siempre la primera opción de cada grupo, lo que cubre ese caso y además
 * evita que el usuario pueda añadir a la cesta sin haber elegido nada.
 *
 * @param {object} props
 * @param {object} props.product Detalle de producto del API.
 */
export function ProductActions({ product }) {
  const { colors, storages } = useMemo(() => getPurchaseOptions(product), [product]);
  const availability = useMemo(() => getPurchaseAvailability(product), [product]);
  const { addItem, status } = useCart();

  const unavailableId = useId();

  const [colorCode, setColorCode] = useState(() => colors[0]?.code ?? null);
  const [storageCode, setStorageCode] = useState(() => storages[0]?.code ?? null);
  const [feedback, setFeedback] = useState(null);

  // Al navegar entre productos se reinicia la selección al primer valor de
  // cada grupo, en vez de arrastrar un código que no pertenece a este producto.
  useEffect(() => {
    setColorCode(colors[0]?.code ?? null);
    setStorageCode(storages[0]?.code ?? null);
    setFeedback(null);
  }, [colors, storages]);

  // Un producto sin precio, sin almacenamiento o sin color no se puede
  // comprar: falta o el importe o alguno de los códigos que exige el POST.
  const canSubmit = availability.isAvailable && colorCode !== null && storageCode !== null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setFeedback(null);

    try {
      await addItem({ id: product.id, colorCode, storageCode });
      setFeedback({ type: 'success', message: 'Producto añadido a la cesta.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error?.message ?? 'No se ha podido añadir el producto. Inténtalo de nuevo.',
      });
    }
  };

  return (
    <section className={styles.actions} aria-labelledby="acciones-titulo">
      <h2 id="acciones-titulo" className={styles.sectionTitle}>
        Acciones
      </h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <OptionSelector
          legend="Almacenamiento"
          name="storage"
          options={storages}
          value={storageCode}
          onChange={setStorageCode}
        />

        <OptionSelector
          legend="Color"
          name="color"
          options={colors}
          value={colorCode}
          onChange={setColorCode}
        />

        {availability.message && (
          <p id={unavailableId} className={styles.unavailable}>
            <span className={styles.unavailableIcon} aria-hidden="true">
              !
            </span>
            {availability.message}
          </p>
        )}

        <div className={styles.purchase}>
          <p className={styles.price}>{formatPrice(product.price)}</p>

          <Button
            type="submit"
            fullWidth
            loading={status === 'adding'}
            disabled={!canSubmit}
            // Un botón deshabilitado sin más deja al usuario adivinando. Al
            // enlazarlo con la explicación, un lector de pantalla la anuncia
            // al llegar al botón.
            aria-describedby={availability.message ? unavailableId : undefined}
          >
            {status === 'adding' ? 'Añadiendo…' : 'Añadir a la cesta'}
          </Button>
        </div>

        {/* Región viva permanente: si solo se montara al haber mensaje, los
            lectores de pantalla podrían no llegar a anunciarlo. */}
        <p
          className={`${styles.feedback} ${feedback ? styles[feedback.type] : ''}`}
          role="status"
          aria-live="polite"
        >
          {feedback?.message ?? ''}
        </p>
      </form>
    </section>
  );
}
