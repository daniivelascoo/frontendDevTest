import { useEffect, useId, useMemo, useState } from 'react';
import { OptionSelector } from './OptionSelector.jsx';
import { Button } from '../ui/Button.jsx';
import { getPurchaseOptions } from '../../lib/productSpecs.js';
import { getPurchaseAvailability } from '../../lib/availability.js';
import { formatPrice } from '../../lib/format.js';
import { useCart } from '../../context/cartContext.js';
import styles from './ProductActions.module.css';

/**
 * Purchase actions: storage and colour selectors, and the add button.
 *
 * The brief requires the selectors to be shown even when there is a single
 * option, and preselected in that case. Here the first option of each group is
 * always preselected, which covers that case and also stops the user from
 * adding to the cart without having chosen anything.
 *
 * @param {object} props
 * @param {object} props.product Product detail from the API.
 */
export function ProductActions({ product }) {
  const { colors, storages } = useMemo(() => getPurchaseOptions(product), [product]);
  const availability = useMemo(() => getPurchaseAvailability(product), [product]);
  const { addItem, status } = useCart();

  const unavailableId = useId();

  const [colorCode, setColorCode] = useState(() => colors[0]?.code ?? null);
  const [storageCode, setStorageCode] = useState(() => storages[0]?.code ?? null);
  const [feedback, setFeedback] = useState(null);

  // Navigating between products resets the selection to the first value of
  // each group, rather than carrying over a code that does not belong to this
  // product.
  useEffect(() => {
    setColorCode(colors[0]?.code ?? null);
    setStorageCode(storages[0]?.code ?? null);
    setFeedback(null);
  }, [colors, storages]);

  // A product without a price, storage or colour cannot be bought: either the
  // amount or one of the codes the POST requires is missing.
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
            // A plainly disabled button leaves the user guessing. Linking it
            // to the explanation makes a screen reader announce the reason on
            // reaching the button.
            aria-describedby={availability.message ? unavailableId : undefined}
          >
            {status === 'adding' ? 'Añadiendo…' : 'Añadir a la cesta'}
          </Button>
        </div>

        {/* Permanent live region: if it were only mounted once there is a
            message, screen readers might never announce it. */}
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
