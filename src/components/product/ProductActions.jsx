import { useEffect, useMemo, useState } from 'react';
import { OptionSelector } from './OptionSelector.jsx';
import { Button } from '../ui/Button.jsx';
import { getPurchaseOptions } from '../../lib/productSpecs.js';
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
  const { addItem, status } = useCart();

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

  // Sin opciones no hay códigos que enviar al API, así que la compra no es
  // posible. Ocurre con productos incompletos del catálogo.
  const hasOptions = colors.length > 0 && storages.length > 0;
  const canSubmit = hasOptions && colorCode !== null && storageCode !== null;

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

        {!hasOptions && (
          <p className={styles.unavailable}>
            Este producto no tiene opciones de compra disponibles.
          </p>
        )}

        <div className={styles.purchase}>
          <p className={styles.price}>{formatPrice(product.price)}</p>

          <Button type="submit" fullWidth loading={status === 'adding'} disabled={!canSubmit}>
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
