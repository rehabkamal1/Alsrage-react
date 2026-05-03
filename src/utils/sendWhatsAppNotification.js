export const sendWhatsAppNotification = (
  transaction,
  oldStatus,
  newStatus,
  orders,
  paymentMethods,
  transferStatuses,
  allTransactionsData,
) => {
  return new Promise(async (resolve) => {
    const order = orders?.find((o) => o.id === transaction.order_id);
    if (!order) {
      resolve(false);
      return;
    }

    const clientPhone = order.client?.phone || order.client?.mobile;
    if (!clientPhone) {
      resolve(false);
      return;
    }

    const statusLabel =
      transferStatuses?.find((s) => s.value === newStatus)?.label ||
      newStatus ||
      "-";
    const oldStatusLabel = oldStatus
      ? transferStatuses?.find((s) => s.value === oldStatus)?.label ||
        oldStatus ||
        "-"
      : "لا توجد حالة سابقة";
    const paymentMethodLabel =
      paymentMethods?.find((p) => p.value === transaction.payment_method)
        ?.label ||
      transaction.payment_method ||
      "-";

    const amount = Number(transaction.amount).toFixed(2);
    const transactionType =
      transaction.type === "receipt" ? "مقبوضات (من العميل)" : "مصروفات";

    const clientTransactions = allTransactionsData.filter(
      (t) => t.order_id === transaction.order_id,
    );
    let totalReceipts = 0;
    let totalPayments = 0;

    clientTransactions.forEach((t) => {
      if (t.id === transaction.id) {
        if (transaction.type === "receipt") {
          totalReceipts += Number(transaction.amount);
        } else {
          totalPayments += Number(transaction.amount);
        }
      } else {
        if (t.type === "receipt") {
          totalReceipts += Number(t.amount);
        } else {
          totalPayments += Number(t.amount);
        }
      }
    });

    const remainingBalance = totalReceipts - totalPayments;

    const message =
      (oldStatus ? `تحديث حالة الحوالة\n\n` : `تم إضافة حوالة جديدة\n\n`) +
      `رقم الحوالة: #${transaction.id}\n` +
      `رقم الطلب: #${transaction.order_number || transaction.order_id}\n` +
      `صاحب التأشيرة: ${order.visa_holder_name || order.client?.visa_holder_name || "-"}\n` +
      `رقم التأشيرة: ${order.visa_number || "-"}\n` +
      `المبلغ: ${amount} ر.س\n` +
      `نوع المعاملة: ${transactionType}\n` +
      `طريقة الدفع: ${paymentMethodLabel}\n` +
      `بنك المستفيد: ${transaction.bank_name || "-"}\n` +
      `رقم الحوالة البنكي: ${transaction.transfer_number || "-"}\n` +
      `تاريخ الحوالة: ${transaction.transfer_date || "-"}\n` +
      (oldStatus ? `الحالة السابقة: ${oldStatusLabel}\n` : "") +
      `الحالة الجديدة: ${statusLabel}\n` +
      `إجمالي المقبوضات: ${totalReceipts.toFixed(2)} ر.س\n` +
      `إجمالي المصروفات: ${totalPayments.toFixed(2)} ر.س\n` +
      `الرصيد المتبقي: ${remainingBalance.toFixed(2)} ر.س\n` +
      `الملاحظات: ${transaction.notes || "-"}\n\n` +
      `هذه رسالة آلية، يرجى عدم الرد عليها.`;

    const encodedMessage = encodeURIComponent(message);

    Swal.fire({
      title: oldStatus ? "تم تحديث الحالة بنجاح!" : "تم إضافة الحوالة بنجاح!",
      text: "هل ترغب في إرسال إشعار عبر الواتساب إلى العميل؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، إرسال",
      cancelButtonText: "لا، شكراً",
      confirmButtonColor: "#25D366",
      cancelButtonColor: "#6c757d",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(
          `https://wa.me/${clientPhone.replace(/\D/g, "")}?text=${encodedMessage}`,
          "_blank",
        );
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
