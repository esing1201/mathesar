<script lang="ts">
  import { get } from 'svelte/store';

  import { Confirmation, ToastPresenter } from '@mathesar-component-library';
  import { confirmationController } from '@mathesar/stores/confirmation';
  import { toast } from '@mathesar/stores/toast';
  import { setUserProfileStoreInContext } from '@mathesar/stores/userProfile';
  import {
    RecordSelectorController,
    setRecordSelectorControllerInContext,
  } from '@mathesar/systems/record-selector/RecordSelectorController';
  import { preloadCommonData } from '@mathesar/utils/preloadData';
  import RootRoute from './routes/RootRoute.svelte';
  import { setNewClipboardHandlerStoreInContext } from './stores/clipboard';
  import { modal } from './stores/modal';
  import { setReleasesStoreInContext } from './stores/releases';
  import ModalRecordSelector from './systems/record-selector/ModalRecordSelector.svelte';

  const commonData = preloadCommonData();
  if (commonData?.user) {
    const userProfile = setUserProfileStoreInContext(commonData.user);
    if (get(userProfile).isSuperUser) {
      // Toggle these lines to test with a mock tag name
      // setReleasesStoreInContext('1.75.0');
      setReleasesStoreInContext(commonData.current_release_tag_name);
    }
  } else {
    // This should never occur
    // TODO: Throw an application wide error
  }

  const clipboardHandlerStore = setNewClipboardHandlerStoreInContext();
  const recordSelectorModal = modal.spawnModalController();
  const recordSelectorController = new RecordSelectorController({
    onOpen: () => recordSelectorModal.open(),
    onClose: () => recordSelectorModal.close(),
    nestingLevel: 0,
  });
  setRecordSelectorControllerInContext(recordSelectorController);

  $: clipboardHandler = $clipboardHandlerStore;

  // Why are we handling clipboard events here?
  //
  // We originally implemented the clipboard handler lower down, in the Sheet
  // component. That worked for Firefox because when the user pressed Ctrl+C the
  // focused `.cell-wrapper` div node would emit a copy event. However, in
  // Chrome and Safari, the focused `.cell-wrapper` div node does _not_ emit
  // copy events! Perhaps that's because it doesn't contain any selected text?
  // Instead, the copy event gets emitted from `body` in Chrome/Safari.
  // Clipboard functionality seems inconsistent in subtle ways across browsers.
  // Make sure to test in all browsers when making changes!
  //
  // On a record page with multiple table widgets, we should be able to copy
  // cells from each table widget, and we should be able to copy plain text on
  // the page, outside of the sheet. We also need to support copying from the
  // Data Explorer.

  function handleCopy(e: ClipboardEvent) {
    if (clipboardHandler) {
      clipboardHandler.handleCopy(e);
      e.preventDefault();
    }
  }
</script>

<svelte:body on:copy={handleCopy} />

<ToastPresenter entries={toast.entries} />
<Confirmation controller={confirmationController} />
<ModalRecordSelector
  {recordSelectorController}
  modalController={recordSelectorModal}
/>

<RootRoute />

<!--
  Supporting aliases in scss within the preprocessor is a bit of work.
  I looked around to try to get it done but it didn't seem important to
  spend time figuring this out.

  The component-library style import would only ever be from App.svelte
  and when the library is moved to a separate package, we wouldn't have to
  worry about aliases.
-->
<style global lang="scss">
  @import 'component-library/styles.scss';

  :root {
    /** BASE COLORS **/
    --color-white: #ffffff;
    --color-blue-light: #e6f0ff;
    --color-blue-medium: #3b82f6;
    --color-blue-dark: #1d4ed8;
    --color-orange-dark: #7c2d12;
    --color-green-medium: #10b981;
    --color-gray-lighter: #fafafa;
    --color-gray-light: #f4f4f5;
    --color-gray-medium: #d4d4d8;
    --color-gray-dark: #a1a1aa;
    --color-gray-darker: #27272a;
    --color-contrast: var(--color-blue-medium);
    --color-contrast-light: var(--color-blue-light);
    --color-link: var(--color-blue-dark);
    --color-text: #171717;
    --color-text-muted: #6b7280;
    --color-substring-match: rgb(254, 221, 72);
    --color-substring-match-light: rgba(254, 221, 72, 0.2);
    --text-size-xx-small: var(--size-xx-small); // 8px
    --text-size-x-small: var(--size-x-small); // 10px
    --text-size-small: var(--size-small); // 12px
    --text-size-base: var(--size-base); // 14px
    --text-size-large: var(--size-large); // 16px
    --text-size-x-large: var(--size-x-large); // 18px
    --text-size-xx-large: var(--size-xx-large); // 20px
    --text-size-ultra-large: var(--size-ultra-large); // 24px
    --text-size-super-ultra-large: var(--size-super-ultra-large); // 32px

    --modal-z-index: 50;
    --modal-record-selector-z-index: 50;

    /** Component theming */
    --Match__highlight-color: var(--color-substring-match);
  }

  body {
    /**
   * This sets the `mix-blend-mode` property for cell backgrounds.
   *
   * Why use color blending instead of opacity? Because I thought it would give
   * us an easier time keeping all our UI colors in sync. With blending, we
   * supply the exact same color value as we'd use for another places in the UI
   * where we expect the color to be opaque.
   *
   * If/when we implement dark mode, we'll need to toggle this property to
   * something like `screen` or `lighten` so that as more backgrounds are
   * applied, the resulting blended background gets lighter instead of darker.
   */
    --cell-bg-mix-blend-mode: multiply;
    /**
   * This establishes a base background color for the cell when no additional
   * background colors are applied. We need this in case there is a background
   * color applied underneath the cell, e.g. on the table or page.
   */
    --cell-bg-color-base: white;
    --cell-bg-color-error: #fef1f1;
    --cell-bg-color-header: #f9f9f9;
    --cell-bg-color-processing: #fefef1;
    --cell-bg-color-disabled: var(--sand-100);
    --cell-bg-color-row-hover: #f6f7f7;
    --cell-bg-color-row-selected: #e4f2ff;

    --color-fk: var(--yellow-300);
    --color-error: #f47171;
    --cell-text-color-processing: #888;
    --color-array-element: #c1e8e8;

    --cell-border-horizontal: 1px solid var(--slate-200);
    --cell-border-vertical: 1px solid var(--slate-200);

    --page-padding: 1em;

    --max-layout-width: 54rem;
    // Setting the header height here
    // since when the header is fixed
    // we can use this variable to add margin-top
    // to the below header content container
    --header-height: 3.7378rem;

    --table-title-header-height: 4.6428rem;

    color: var(--slate-800);

    --modal-z-index: 1;
    --dropdown-z-index: 1;
    --cell-errors-z-index: 1;
    --toast-z-index: 2;
    --app-header-z-index: 1;

    overflow: hidden;
    height: 100vh;
  }

  h1 {
    margin: 0 0 1rem 0;
    font-size: var(--size-xx-large);
    font-weight: 500;
  }

  .block {
    display: block;
  }

  .trim-child-margins > :first-child {
    margin-top: 0;
  }
  .trim-child-margins > :last-child {
    margin-bottom: 0;
  }

  /**
   * Used to turn elements like `<button>` and `<a>` into plain elements that
   * don't have any browser styling but still have functionality.
   */
  .passthrough {
    background: none;
    border-radius: 0;
    border: none;
    color: inherit;
    cursor: inherit;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    text-align: inherit;
    text-decoration: inherit;
    margin: 0;
    padding: 0;
  }

  .postgres-keyword {
    font-size: 80%;
    padding: 0.02em 0.3em;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    color: rgba(0, 0, 0, 0.6);
    font-weight: bold;
  }

  .large-bold-header {
    font-size: var(--size-large);
    font-weight: 600;
  }

  .bold-header {
    font-weight: 500;
  }
</style>
