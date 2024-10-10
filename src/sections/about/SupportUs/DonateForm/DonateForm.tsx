'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import {
  SUBSCRIPTION_OPTIONS,
  PAYMENT_AMOUNT_DATA,
} from '@/constants/donateForm/donateForm';
import Button from '@/components/ui/Button';
import DonateFormContent from './DonateFormContent';
import axios from 'axios';
import Script from 'next/script'; //New W
import useModalDonateStore from '@/state/stateModalDonate';
import useTransactionStore from '@/state/TransactionState';

declare const Wayforpay: any; //New W

const isMobile = () => {
  return (
    typeof window !== 'undefined' &&
    /(Mobi|Android|iPhone|iPad|iPod)/i.test(navigator.userAgent)
  );
}; // New N

export interface DonateFormProps {
  isOpen?: boolean;
  className?: string;
  modal?: boolean;
}

export default function DonateForm({
  isOpen = false,
  modal = false,
  className,
}: DonateFormProps) {
  const t = useTranslations('Home.DonateForm');
  const currentLocale = useLocale();
  const { isModalOpen, closeModal, openModal } = useModalDonateStore();
  const { transactionStatus, setTransactionStatus } = useTransactionStore(); //"Declined","Approved"

  const [activeButton, setActiveButton] = useState<string>('once');
  const [donationAmount, setDonationAmount] = useState<number | ''>('');
  const [errorDonationAmount, setErrorDonationAmount] =
    useState<boolean>(false);

  useEffect(() => {
    const handleEvent = (event: MessageEvent) => {
      if (event.data === 'WfpWidgetEventClose') {
        if (transactionStatus === 'Declined') {
          //!!!!! Then change to "Approved", and in ModalDonate also!

          openModal();
        }
      }
    };

    window.addEventListener('message', handleEvent);

    return () => {
      window.removeEventListener('message', handleEvent);
    };
  }, [openModal, transactionStatus]);

  const handleAmountChange = (value: string) => {
    setErrorDonationAmount(false);
    setDonationAmount(value === '' ? '' : parseFloat(value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTransactionStatus('');
    // setIsLoading(true);
    // donationAmount validation
    if (donationAmount === '' || donationAmount <= 0 || isNaN(donationAmount)) {
      setErrorDonationAmount(true);
      return;
    }
    //---------------
    const paymentData = {
      // transactionType: 'CREATE_INVOICE',
      merchantDomainName: window.location.hostname, //????
      apiVersion: 1,
      orderReference: `id-${Date.now()}`,
      orderDate: Date.now(),
      amount: donationAmount,
      language: currentLocale,
      currency: 'UAH',
      productName: ['Peacefull Warrior support'],
      productCount: [1],
      productPrice: [donationAmount],
      regularMode: activeButton,
      //regularAmount,
     // paymentSystems: 'card;googlePay;applePay;privat24', //for later

      defaultPaymentSystem: 'card',
      serviceUrl: `${window.location.origin}/${currentLocale}/api/payment/complete`,
    };

  

    try {
      const response = await axios.post(
        `/${currentLocale}/api/payment`,
        paymentData
      ); // to our API

    
      const { merchantSignature } = response.data; //New W

      if (isModalOpen) {
        closeModal();
      }
      const wayforpay = new Wayforpay(); //New W

      wayforpay.run(
        //New W
        {
          ...paymentData,
          merchantAccount: 'test_merch_n1', // Think about env
          merchantSignature: merchantSignature,
          authorizationType: 'SimpleSignature',
          straightWidget: isMobile(),
        },
        //approved
        function (response: any) {
          // console.log('Payment approved in f', response.transactionStatus);
          setTransactionStatus(response.transactionStatus);
        },
        //declined
        function (response: any) {
          // console.log('Payment declined in f', response.transactionStatus);
          setTransactionStatus(response.transactionStatus);
        },
        // processing
        function (response: any) {
          // console.log('Payment processing in f', response.transactionStatus);
          setTransactionStatus(response.transactionStatus);
        }
      );
    } catch (error) {
      // New W
      console.error('Error processing  widget:', error);
    }
    //We can process the result of interaction of  user  with widget-
    // For a while don't delete!!
    // window.addEventListener(
    //   'message',
    //   function (event) {
    //     //setWfpWidgetData(event.data);
    //     //  console.log(event.data);

    //     //     // if (event.data === 'WfpWidgetEventApproved') {
    //     //     //   // window.location.href = '/success-page-url'; // Replace with the URL you want to redirect to
   
    //     //     // } else if (event.data === 'WfpWidgetEventDeclined') {
   
    //     //     // } else if (event.data === 'WfpWidgetEventPending') {
    //     //     //   console.log('Payment is being processed', event.data);
    //     //     // } else
    //     if (event.data === 'WfpWidgetEventClose') {
    //
    //       if (transactionStatus === 'Declined') {
    //
    //         openModal();
    //       } //!!!!! Then change to "Approved"

    //     }
    //   },
    //   false
    // );

    setDonationAmount('');

    setErrorDonationAmount(false);
  };
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={clsx(
          'm-auto flex flex-col gap-y-8 tablet:gap-y-10',
          modal
            ? 'mobile:w-[298px] tablet:w-[646px] desktop:w-[800px]'
            : 'mobile:w-[343px] tablet:w-[680px] desktop:w-[907px]',
          className
        )}
      >
        {/* Choose subscriptionOption */}
        <DonateFormContent
          paymentAmountData={PAYMENT_AMOUNT_DATA}
          subscriptionOptions={SUBSCRIPTION_OPTIONS}
          activeButton={activeButton}
          setActiveButton={setActiveButton}
          donationAmount={donationAmount}
          handleAmountChange={handleAmountChange}
          errorDonationAmount={errorDonationAmount}
          modal={modal}
        />
        <Button
          type="submit"
          className="mx-auto desktop:mt-4"
          aria-label={t('aria-label-btn')}
          modal={isOpen}
        >
          {t('support-btn')}
        </Button>
      </form>
      <Script
        id="wayforpay-script"
        src="https://secure.wayforpay.com/server/pay-widget.js"
        strategy="afterInteractive"
      />
    </>
  );
}
